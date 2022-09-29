import {Logger} from "../../Logger";
import {Dbs} from "../containers/RepoContainer";
import {EnergyData} from "../../models/stoneSubModels/stone-energy-data.model";
import {EnergyIntervalDataSet} from "./IntervalData";
import {DataObject} from "@loopback/repository";
import {EnergyDataProcessed} from "../../models/stoneSubModels/stone-energy-data-processed.model";
import {Energy} from "../../controllers/energy.controller";

const log = Logger(__filename);

const INTERPOLATION_THRESHOLD = 5;

type samplePointGetter = (timestamp: number) => number
interface IntervalDescription {
  intervalMs: number,
  calculateSamplePoint: samplePointGetter,
  interval: EnergyInterval
}
export function minuteInterval(timestamp:number) : number {
  return new Date(timestamp).setSeconds(0,0);
}

// get the latest exact fiveminute timestamp from the provided timestamp
function fiveMinuteInterval(timestamp: number) : number {
  let date = new Date(timestamp);
  date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
  return date.valueOf();
}



export class EnergyDataProcessor {

  async processMeasurements(sphereId: string) {
    let iterationRequired = true;
    let iterationSize = 500;

    let count = 0;
    while (iterationRequired) {
      let energyData = await Dbs.stoneEnergy.find({
        where: {checked: false, sphereId: sphereId},
        limit: iterationSize,
        order: ['timestamp ASC']
      });

      count += energyData.length;
      if (energyData.length === iterationSize) {
        iterationRequired = true;
      } else {
        iterationRequired = false;
      }

      // -------------------------------------------------------
      // sort in separate lists per stone.
      let stoneEnergy: { [stoneId: string]: EnergyData[] } = {};
      if (energyData.length > 0) {
        for (let i = 0; i < energyData.length; i++) {
          let energy = energyData[i];
          if (stoneEnergy[energy.stoneId] === undefined) {
            stoneEnergy[energy.stoneId] = [];
          }
          stoneEnergy[energy.stoneId].push(energy);
        }
      }

      try {
        // handle it for each stone separately
        let stoneIds = Object.keys(stoneEnergy);
        for (let i = 0; i < stoneIds.length; i++) {
          await this._processStoneEnergy(stoneIds[i], stoneEnergy[stoneIds[i]])
        }
      }
      catch (e) {
        log.info("processMeasurements: Error in _processStoneEnergy", e);
        break;
      }
    }
  }


  async _processStoneEnergy(stoneId: string, energyData: EnergyData[]) {
    // we want at least 2 points to process.
    if (energyData.length === 0) {
      return
    }
    let samples: DataObject<EnergyDataProcessed>[] = [];

    // get the lastProcessed datapoint.
    let startFromIndex = 0;
    let lastDatapoint : EnergyData = await Dbs.stoneEnergy.findOne({
      where: {
        stoneId: stoneId,
        timestamp: {lt: energyData[0].timestamp},
        checked: true
      }, order: ['timestamp DESC']
    });

    if (!lastDatapoint) {
      if (energyData.length < 2) {
        return;
      }
      startFromIndex = 1;
      lastDatapoint = energyData[0];
    }
    let idsToDelete = [lastDatapoint.id];
    for (let i = startFromIndex; i < energyData.length; i++) {
      let datapoint = energyData[i];
      idsToDelete.push(datapoint.id);
      processPair(lastDatapoint, datapoint, {calculateSamplePoint: fiveMinuteInterval, intervalMs: 5*60e3, interval: '5m'}, samples);
      lastDatapoint = datapoint;
    }


    if (samples.length > 0) {
      // remove the lastDataPoint from the samples to be removed.
      idsToDelete.pop();

      // all processed datapoints have been marked, except the last one, and possible the very first one. If we have samples, then the very first one has been used.
      // we mark it processed because of that.
      await Dbs.stoneEnergyProcessed.createAll(samples);
      await Dbs.stoneEnergy.deleteAll({id:{inq: idsToDelete}});
      await Dbs.stoneEnergy.update(lastDatapoint);
    }
  }


  async processAggregations(sphereId: string) {
    let stoneIdArray = (await Dbs.stone.find({where: {sphereId: sphereId}, fields: {id: true}})).map((stone) => { return stone.id; });
    // create map from array
    for (let stoneId of stoneIdArray) {
      for (let aggregationInterval in EnergyIntervalDataSet) {
        let intervalData = EnergyIntervalDataSet[(aggregationInterval as string)];
        await this.processStoneAggregations(sphereId, stoneId, intervalData);
      }
    }
  }


  async processStoneAggregations(sphereId: string, stoneId: string, intervalData: EnergyIntervalData) {
    log.debug("Start processing Aggregations...")

    let samples : DataObject<EnergyDataProcessed>[] = [];
    let idsToDelete : string[] = [];

    // @ts-ignore
    await this._processAggregations(sphereId, stoneId, intervalData, samples, idsToDelete);

    await Dbs.stoneEnergyProcessed.createAll(samples);
    await Dbs.stoneEnergyProcessed.deleteAll({id: {inq: idsToDelete}});
  }


  async _processAggregations(
    sphereId: sphereId,
    stoneId: stoneId,
    intervalData: EnergyIntervalData,
    samples: DataObject<EnergyDataProcessed>[],
    idsToDelete: string[]
  ) {
    // find the most recent point of this interval level. We will start from there.
    let lastPoint = await Dbs.stoneEnergyProcessed.findOne({where: {stoneId: stoneId, interval: intervalData.targetInterval}, order: ['timestamp DESC']});
    log.debug("Last point to start processing ",intervalData.targetInterval,"from:", lastPoint)
    let fromDate = lastPoint && lastPoint.timestamp || new Date(0);

    let iterationRequired = true;
    let iterationSize     = 1000;

    while (iterationRequired) {
      let processedPoints = await Dbs.stoneEnergyProcessed.find({where: {stoneId: stoneId, or: [{interval: intervalData.basedOnInterval}, {interval: 'fragment'}], timestamp: {gt: fromDate}}, limit: iterationSize, order: ['timestamp ASC'] });
      iterationRequired = processedPoints.length === iterationSize;

      log.debug("Aggregating stone", stoneId, "at", intervalData.targetInterval, "based on", intervalData.basedOnInterval, "from", fromDate, ":", processedPoints.length);

      fromDate = this._processAggregationPoints(sphereId, stoneId, processedPoints, intervalData, samples, idsToDelete);
      if (fromDate === null) {
        break;
      }
    }
  }

  _processAggregationPoints(
    sphereId: sphereId,
    stoneId: stoneId,
    processedPoints: EnergyDataProcessed[],
    intervalData: EnergyIntervalData,
    samples: DataObject<EnergyDataProcessed>[],
    idsToDelete: string[]
  ) : Date {
    let previousPoint : EnergyDataProcessed | null = null;

    console.log("Processing points", sphereId, stoneId, processedPoints.length);


    for (let i = 0; i < processedPoints.length; i++) {
      let point = processedPoints[i];
      let timestamp  = new Date(point.timestamp).valueOf();
      let isONsamplePoint = intervalData.isOnSamplePoint(timestamp);
      // console.log(new Date(timestamp), isONsamplePoint, intervalData.targetInterval, intervalData.basedOnInterval);

      if (isONsamplePoint) {
        samples.push({stoneId: stoneId, sphereId: sphereId, energyUsage: point.energyUsage, timestamp: point.timestamp, interval: intervalData.targetInterval});
      }
      else if (previousPoint) {
        let usedPreviousPoint = false;
        let previousTimestamp = new Date(previousPoint.timestamp).valueOf();

        let previousSamplePointFromCurrent = intervalData.getPreviousSamplePoint(timestamp);
        let previousSamplePointFromLast    = intervalData.getPreviousSamplePoint(previousTimestamp);

        // this means these items fall in the same bucket
        if (previousSamplePointFromCurrent == previousSamplePointFromLast) {
          // console.log("same_slot", new Date(previousSamplePointFromCurrent).toLocaleString(), new Date(previousSamplePointFromLast).toLocaleString(), new Date(timestamp).toLocaleString(), new Date(previousTimestamp).toLocaleString())
          // do nothing
          // previous point fell within a bucket of this interval, if it is a fragment, it can be removed
          usedPreviousPoint = true;
        }
        else {
          // this means that the point exactly ON the datapoint is missing, but we have one before, and one after (a number?) of points.
          let dt = timestamp - previousTimestamp;
          let dJ = point.energyUsage - previousPoint.energyUsage;
          let dJms = dJ / dt;
          let elapsedSamplePoints = intervalData.getNumberOfSamplePointsBetween(previousSamplePointFromLast, previousSamplePointFromCurrent);
          // allow interpolation.
          if (elapsedSamplePoints <= intervalData.interpolationThreshold) {
            for (let j = 0; j < elapsedSamplePoints; j++ ) {
              let samplePoint = intervalData.getNthSamplePoint(previousSamplePointFromLast, (1+j));
              let dt = samplePoint - previousTimestamp;
              let energyAtPoint = previousPoint.energyUsage + dt*dJms;
              samples.push({stoneId: stoneId, sphereId: sphereId, energyUsage: Math.round(energyAtPoint), timestamp: new Date(samplePoint), interval: intervalData.targetInterval});
              usedPreviousPoint = true;
            }
          }
        }

        if (usedPreviousPoint) {
          if (previousPoint.interval === 'fragment') {
            idsToDelete.push(previousPoint.id);
          }
        }
      }
      previousPoint = point;
    }
    if (previousPoint) {
      return previousPoint.timestamp;
    }

    return null;
  }
}

export async function processPair(
  previousPoint: EnergyData,
  nextPoint: EnergyData,
  intervalData: IntervalDescription,
  samples: DataObject<EnergyDataProcessed>[]) {
  if (previousPoint.checked === false) {
    processSinglePoint(previousPoint, intervalData, samples);
  }
  processDataPair(previousPoint, nextPoint, intervalData, samples);
}


/**
 * This method is only used if there is no history available. This is the first point.
 * We only have to check if it is exactly at a sample interval.
 * @param previousPoint
 */
function processSinglePoint(
  datapoint: EnergyData,
  intervalData: IntervalDescription,
  samples: DataObject<EnergyDataProcessed>[],
) {
  let prevTime = datapoint.timestamp.valueOf();
  let correspondingSamplePoint = intervalData.calculateSamplePoint(prevTime);
  if (prevTime === correspondingSamplePoint) {
    samples.push({
      sphereId:    datapoint.sphereId,
      stoneId:     datapoint.stoneId,
      energyUsage: datapoint.energyUsage,
      timestamp:   new Date(correspondingSamplePoint),
      interval:    intervalData.interval
    });
    datapoint.processed = true;
  }

  datapoint.correctedEnergyUsage = datapoint.energyUsage;
  datapoint.checked = true;

  // await Dbs.stoneEnergy.update(datapoint).catch((e) => {log.error("Error persisting processed boolean on datapoint", e);})
}

function processDataPair(
  previouslyProcessedPoint: EnergyData,
  nextDatapoint:            EnergyData,
  intervalData:             IntervalDescription,
  samples: DataObject<EnergyDataProcessed>[]
) {
  let nextTimestamp         = nextDatapoint.timestamp.valueOf();
  let nextValue             = nextDatapoint.energyUsage;
  let previousTimestamp     = previouslyProcessedPoint.timestamp.valueOf();
  let previousRawValue      = previouslyProcessedPoint.energyUsage;
  let previousValue         = previouslyProcessedPoint.correctedEnergyUsage;
  let offsetValue           = previousValue - previouslyProcessedPoint.energyUsage;

  let previousSamplePoint   = intervalData.calculateSamplePoint(previousTimestamp);
  let nextSamplePoint       = intervalData.calculateSamplePoint(nextTimestamp);

  let timeSinceLastSamplePoint = nextTimestamp - previousTimestamp;

  // if energyAtPoint is larger than the offsetValue, we just accept the new measurement.
  // if it is smaller, we will add the energyAtPoint to the offsetValue.
  // The reason here is that we will assume a reset, and that the energy from 0 to energyAtPoint is consumed.
  // This can miss a second reboot when we're not listening.
  // TODO: check if the difference is within the thresold of negative usage, then accept that we have negative usage.
  if (nextValue < previousRawValue*0.9) { // we compare with raw, since previousValue has the offset included.
    nextValue += previousValue;
  }
  else {
    nextValue += offsetValue;
  }

  // if after the initial correction above the nextValue is still lower than the previous value, ignore the decrease and make them equal.
  // We do not support decreases in energy at this point. Doing this here is important, since it is also sort of handled below in the dJ calculation,
  // because nextValue is used to store the correctedEnergyUsage in the wrap up method.
  if (nextValue < previousValue) {
    nextValue = previousValue;
  }

  function wrapUp(processed: boolean = false) {
    if (processed) {
      nextDatapoint.processed = true;
    }
    nextDatapoint.checked = true;
    nextDatapoint.correctedEnergyUsage = nextValue;
    // await Dbs.stoneEnergy.update(nextDatapoint).catch((e) => {log.error("Error persisting checked boolean on datapoint", e);})
  }

  // we sample every 1 minute, on the minute.
  // we only have to interpolate the point if:
  //   - the previous point is before the minute, and the current is equal or after the minute
  //   - in this case, the previous and the current are both in the same bucket. Process

  if (previousTimestamp > nextSamplePoint) {
    wrapUp();
    return;
  }

  // We will now check how many sample points have elapsed since last sample time and current sample time.
  // we ceil this since, if we are here, we know that the sample point is in between these points.
  let elapsedSamplePoints = Math.ceil((nextSamplePoint - previousSamplePoint) / intervalData.intervalMs); // ms
  // If more than 5 points have elapsed, we do not do anything WITH the prev and mark the prev as checked.
  // We do have to consider if the current is exactly ON the sample interval.
  if (elapsedSamplePoints > INTERPOLATION_THRESHOLD) {
    // this hardly ever happens.
    let storeProcessedPoint = nextTimestamp === nextSamplePoint;
    if (storeProcessedPoint) {
      samples.push({sphereId: nextDatapoint.sphereId, stoneId: nextDatapoint.stoneId, energyUsage: nextValue, timestamp: new Date(nextSamplePoint), interval: intervalData.interval});
    }
    else {
      if (previouslyProcessedPoint.processed === false) {
        samples.push({sphereId: previouslyProcessedPoint.sphereId, stoneId: previouslyProcessedPoint.stoneId, energyUsage: previousValue, timestamp: previouslyProcessedPoint.timestamp, interval: 'fragment'});
        previouslyProcessedPoint.processed = true;
        // await Dbs.stoneEnergy.update(previouslyProcessedPoint).catch((e) => {log.error("Error persisting checked boolean on datapoint", e);})
      }
      // console.log("Orphaned datapoint. ", previouslyProcessedPoint);
    }
    wrapUp(storeProcessedPoint);
    log.debug("Gap is too large. Mark as checked.");
    return;
  }


  // if less than 5 have elapsed, we do a linear interpolation, one for each point
  // Before processing, we check if the current is larger or equal than the previous.
  // If it is not, we assume that a reset has taken place.
  //       -- IF CURRENT < PREV with more than 1000J (diff is about 20W for a minute) or 25% of the previous value. If the previous value is large, we require a larger jump
  //               -- reset, so dJ = currentJ. Current has started again from 0, so usage is the current value.
  //       -- IF CURRENT < PREV with less than 1000J
  //               -- negative drift, flatten to 0J used.
  //       -- IF CURRENT >= PREV
  //               -- calculate dJ
  let dJ = nextValue - previousValue;
  if (dJ < -1*Math.max(0.25*previousValue, 1000)) {
    dJ = nextValue;
  }
  if (dJ <= 0) {
    dJ = 0;
  }
  else {
    // we just use dJ
  }
  let dJms = dJ / timeSinceLastSamplePoint;

  // @IMPROVEMENT:
  // use the pointPowerUsage on prev and on current to more accurately estimate interpolated points.
  // for now, use linear.
  let storedProcessedPoint = false;
  for (let j = 0; j < elapsedSamplePoints; j++ ) {
    let samplePoint = previousSamplePoint + (1+j)*intervalData.intervalMs;
    let dt = samplePoint - previousTimestamp;
    let energyAtPoint = previousValue + dt*dJms;
    samples.push({sphereId: nextDatapoint.sphereId, stoneId: nextDatapoint.stoneId, energyUsage: Math.round(energyAtPoint), timestamp: new Date(samplePoint), interval: intervalData.interval});
    storedProcessedPoint = true;
  }

  wrapUp(storedProcessedPoint);
}


let aggregating = false;
export async function AggegateAllSpheres() {
  if (aggregating) {
    log.info("Already aggregating, skipping this call.");
    return;
  }

  let spheres = await Dbs.sphere.find({fields:{id:true}}).catch((e) => {log.error("Error getting spheres", e);});
  if (!spheres) { return ;}
  let sphereIds = spheres.map((sphere) => { return sphere.id; });


  aggregating = true;
  let processor = new EnergyDataProcessor();

    let intervalData = EnergyIntervalDataSet[interval];

    let pointsOfInterval = await Dbs.stoneEnergyProcessed.find({where: {sphereId: interval: intervalData.targetInterval}, order: ['timestamp DESC'], fields:{sphereId: true, stoneId: true, timestamp: true}});

    // sort points per sphere
    let pointsPerSphere : Record<string, EnergyDataProcessed[]> = {};
    for (let i = 0; i < pointsOfInterval.length; i++) {
      let point = pointsOfInterval[i];
      if (pointsPerSphere[point.sphereId] === undefined) {
        pointsPerSphere[point.sphereId] = [];
      }
      pointsPerSphere[point.sphereId].push(point);
    }

    let stoneEnergyPoints = await Dbs.stoneEnergyProcessed.find({where: {or: [{interval: intervalData.basedOnInterval}, {interval: 'fragment'}]}, fields:{sphereId: true}});

    // get sphereId map from stoneEnergyPoints
    let sphereIdMap : Record<string, boolean> = {};
    for (let i = 0; i < stoneEnergyPoints.length; i++) {
      sphereIdMap[stoneEnergyPoints[i].sphereId] = true;
    }

    for (let sphereId in sphereIdMap) {
      for (let interval in EnergyIntervalDataSet) {
      console.log("Handling", interval, sphereId);
      console.time("aggregate");
      let samples : DataObject<EnergyDataProcessed>[] = [];
      let idsToDelete : string[] = [];

      // @ts-ignore
      let timestampOrQuery = {or: []};
      let mostRecentPoints: Record<string, number> = {};
      if (pointsPerSphere[sphereId] !== undefined) {
        // get the most recentpoint for all stones in the pointsOfInterval array
        for (let point of pointsOfInterval) {
          if (mostRecentPoints[point.stoneId] === undefined) {
            mostRecentPoints[point.stoneId] = point.timestamp.valueOf();
          }
          else {
            if (mostRecentPoints[point.stoneId] < point.timestamp.valueOf()) {
              mostRecentPoints[point.stoneId] = point.timestamp.valueOf();
            }
          }
        }

        // get the minimum timestamp of all the stones to query the sphere with.
        for (let stoneId in mostRecentPoints) {
          let mostRecentPoint = mostRecentPoints[stoneId];
          timestampOrQuery.or.push({and: [{stoneId: stoneId}, {timestamp: {gt: new Date(mostRecentPoint)}}]});
        }
      }

      if (timestampOrQuery.or.length === 0) {
        continue;
      }

      let processedPoints = await Dbs.stoneEnergyProcessed.find({where: {and: [{sphereId: sphereId}, {or: [{interval: intervalData.basedOnInterval}, {interval: 'fragment'}]}, timestampOrQuery]}, order: ['timestamp ASC'] });
      // split points in stoneId arrays
      let stoneIdArrays : Record<string, any[]> = {};
      for (let point of processedPoints) {
        if (stoneIdArrays[point.stoneId] === undefined) {
          stoneIdArrays[point.stoneId] = [];
        }
        stoneIdArrays[point.stoneId].push(point);
      }

      // process each stoneId array
      for (let stoneId in stoneIdArrays) {
        if (stoneIdArrays[stoneId].length < 2) { continue; }
        processor._processAggregationPoints(sphereId, stoneId, stoneIdArrays[stoneId], intervalData, samples, idsToDelete);
      }


      console.timeEnd("aggregate");
      if (samples.length > 0) {
        // console.log("Storing samples", samples)
        await Dbs.stoneEnergyProcessed.createAll(samples);
      }
      if (idsToDelete.length > 0) {
        // console.log("deleting samples")
        await Dbs.stoneEnergyProcessed.deleteAll({id: {inq: idsToDelete}});
      }
    }
  }
  aggregating = false;

  console.log("Finished")
}







