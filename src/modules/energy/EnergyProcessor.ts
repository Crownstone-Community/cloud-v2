import {Logger} from "../../Logger";
import {Dbs} from "../containers/RepoContainer";
import {EnergyData} from "../../models/stoneSubModels/stone-energy-data.model";
import {EnergyIntervalDataSet} from "./IntervalData";
import {DataObject} from "@loopback/repository";
import {EnergyDataProcessed} from "../../models/stoneSubModels/stone-energy-data-processed.model";
import {Energy} from "../../controllers/energy.controller";
import {PerformanceHandler} from "../dataManagement/PerformanceHandler";
import {HttpErrors} from "@loopback/rest";


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


function hourInterval(timestamp: number) : number {
  let date = new Date(timestamp);
  date.setMinutes(0,0,0);
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
      if (samples.length     > 0) { await Dbs.stoneEnergyProcessed.createAll(samples); }
      if (idsToDelete.length > 0) { await Dbs.stoneEnergy.deleteAll({id: {inq: idsToDelete}}); }
      await Dbs.stoneEnergy.update(lastDatapoint);
    }
  }


  async processAggregations(sphereId: string) {
    let sphereTimezone = await Dbs.sphere.findById(sphereId, {fields: {timezone:true}});
    if (!sphereTimezone.timezone) { throw new HttpErrors.FailedDependency("No timezone is defined for this sphere. Enter the sphere to have it set automatically, or restart your app to have it do so (App version 6.0.0 and higher)."); }


    let stoneIdArray = (await Dbs.stone.find({where: {sphereId: sphereId}, fields: {id: true}})).map((stone) => { return stone.id; });
    // create map from array
    for (let aggregationInterval in EnergyIntervalDataSet) {
      let samples : DataObject<EnergyDataProcessed>[] = [];
      let idsToDelete : string[] = [];
      for (let stoneId of stoneIdArray) {
          let intervalData = EnergyIntervalDataSet[(aggregationInterval as string)];
          await this._processAggregations(sphereId, stoneId, intervalData, samples, idsToDelete, sphereTimezone.timezone);
      }

      if (samples.length     > 0) { await Dbs.stoneEnergyProcessed.createAll(samples); }
      if (idsToDelete.length > 0) { await Dbs.stoneEnergyProcessed.deleteAll({id: {inq: idsToDelete}}); }
    }
  }


  async processStoneAggregations(sphereId: string, stoneId: string, intervalData: EnergyIntervalData, timezone: timezone) {
    log.debug("Start processing Aggregations...")

    let samples : DataObject<EnergyDataProcessed>[] = [];
    let idsToDelete : string[] = [];

    // @ts-ignore
    await this._processAggregations(sphereId, stoneId, intervalData, samples, idsToDelete, timezone);

    if (samples.length     > 0) { await Dbs.stoneEnergyProcessed.createAll(samples); }
    if (idsToDelete.length > 0) { await Dbs.stoneEnergyProcessed.deleteAll({id: {inq: idsToDelete}}); }
  }


  async _processAggregations(
    sphereId: sphereId,
    stoneId: stoneId,
    intervalData: EnergyIntervalData,
    samples: DataObject<EnergyDataProcessed>[],
    idsToDelete: string[],
    timezone: timezone,
    monitor: PerformanceHandler = null
  ) {
    if (!timezone) {
      console.log("Could not aggregate sphere", sphereId, "stone", stoneId, "because timezone is not set.");
      return;
    }

    // find the most recent point of this interval level. We will start from there.
    monitor?.start("findOne where stoneId interval, order timestamp DESC", 'findOne-query');
    let lastPoint = await Dbs.stoneEnergyProcessed.findOne({where: {stoneId: stoneId, interval: intervalData.targetInterval}, order: ['timestamp DESC']});
    monitor?.end();


    log.debug("Last point to start processing ",intervalData.targetInterval,"from:", lastPoint)
    let fromDate = lastPoint && lastPoint.timestamp || new Date(0);

    let iterationRequired = true;
    let iterationSize     = 1000;

    while (iterationRequired) {
      monitor?.start("find where stoneId interval and fragment, timestamp. order timestamp ASC", 'find-query');
      let processedPoints = await Dbs.stoneEnergyProcessed.find({where: {stoneId: stoneId, or: [{interval: intervalData.basedOnInterval}, {interval: 'fragment'}], timestamp: {gt: fromDate}}, limit: iterationSize, order: ['timestamp ASC'] });
      monitor?.end();
      iterationRequired = processedPoints.length === iterationSize;

      log.debug("Aggregating stone", stoneId, "at", intervalData.targetInterval, "based on", intervalData.basedOnInterval, "from", fromDate, ":", processedPoints.length);

      monitor?.start('_processAggregationPoints');
      fromDate = this._processAggregationPoints(sphereId, stoneId, processedPoints, intervalData, samples, idsToDelete, timezone);
      monitor?.end();
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
    idsToDelete: string[],
    timezone: timezone
  ) : Date {
    let previousPoint : EnergyDataProcessed | null = null;

    for (let i = 0; i < processedPoints.length; i++) {
      let point = processedPoints[i];
      let timestamp  = new Date(point.timestamp).valueOf();
      let isONsamplePoint = intervalData.isOnSamplePoint(timestamp, timezone);
      // console.log(new Date(timestamp), isONsamplePoint, intervalData.targetInterval, intervalData.basedOnInterval);

      if (isONsamplePoint) {
        samples.push({stoneId: stoneId, sphereId: sphereId, energyUsage: point.energyUsage, timestamp: point.timestamp, interval: intervalData.targetInterval});
      }
      else if (previousPoint) {
        let usedPreviousPoint = false;
        let previousTimestamp = new Date(previousPoint.timestamp).valueOf();

        let previousSamplePointFromCurrent = intervalData.getPreviousSamplePoint(timestamp, timezone);
        let previousSamplePointFromLast    = intervalData.getPreviousSamplePoint(previousTimestamp, timezone);

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
          let elapsedSamplePoints = intervalData.getNumberOfSamplePointsBetween(previousSamplePointFromLast, previousSamplePointFromCurrent, timezone);
          // allow interpolation.
          if (elapsedSamplePoints <= intervalData.interpolationThreshold) {
            for (let j = 0; j < elapsedSamplePoints; j++ ) {
              let samplePoint = intervalData.getNthSamplePoint(previousSamplePointFromLast, (1+j), timezone);
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

export function processPair(
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
  samples:                  DataObject<EnergyDataProcessed>[]
) {
  let nextTimestamp       = nextDatapoint.timestamp.valueOf();
  let nextValue           = nextDatapoint.energyUsage;
  let previousTimestamp   = previouslyProcessedPoint.timestamp.valueOf();
  let previousRawValue    = previouslyProcessedPoint.energyUsage;
  let previousValue       = previouslyProcessedPoint.correctedEnergyUsage;
  let offsetValue         = previousValue - previouslyProcessedPoint.energyUsage;

  let previousSamplePoint = intervalData.calculateSamplePoint(previousTimestamp);
  let nextSamplePoint     = intervalData.calculateSamplePoint(nextTimestamp);

  let timeSinceLastSamplePoint = nextTimestamp - previousTimestamp;

  // if energyAtPoint is larger than the offsetValue, we just accept the new measurement.
  // if it is smaller, we will add the energyAtPoint to the offsetValue.
  // The reason here is that we will assume a reset, and that the energy from 0 to energyAtPoint is consumed.
  // This can miss a second reboot when we're not listening.
  // TODO: check if the difference is within the threshold of negative usage, then accept that we have negative usage.
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


export let AGGREGATING = false;
export async function AggegateAllSpheres(force = false) {
  if (AGGREGATING) {
    console.error("Already aggregating, skipping this call.");
    return;
  }

  AGGREGATING = true;
  try {
    await _aggregateAllSpheres();
  }
  catch (err: any) {
    console.error("Error in aggregateAllSpheres", err);
  }
  finally {
    AGGREGATING = false;
    console.log("Finished")
  }
}

async function _aggregateAllSpheres(force = false) {
  // check from whence we have to get the data
  let metaData = await Dbs.metaData.findOne({where:{type:"aggregationTime"}});
  let fromTime = new Date(0);
  if (metaData !== null && !force) {
    fromTime = metaData.timestamp;
  }

  // let monitor : PerformanceHandler = new PerformanceHandler()
  let monitor : PerformanceHandler = null; // new PerformanceHandler()

  console.log("Aggregating from", fromTime);

  // all stones that have new data since the last aggregation.
  let energyMetaDataSet = await Dbs.stoneEnergyMetaData.find({where:{updatedAt: {gt: fromTime}}}).catch((e) => {log.error("Error getting metadata", e);});
  if (!energyMetaDataSet || energyMetaDataSet.length === 0) { return; }

  // get unique sphereIds from the energyMetaDataSet to get their timezones
  let sphereIds = energyMetaDataSet.map((metaData) => { return metaData.sphereId; });
  let spheres = await Dbs.sphere.find({where:{id: {inq: sphereIds}}, fields:{id:true, timezone: true}}).catch((e) => {log.error("Error getting spheres", e);});
  let timezoneMap : Record<sphereId, timezone> = {};
  if (!spheres) { return; }
  for (let sphere of spheres) {
    timezoneMap[sphere.id] = sphere.timezone;
  }

  let processor = new EnergyDataProcessor();
  for (let interval in EnergyIntervalDataSet) {
    let intervalData = EnergyIntervalDataSet[interval];

    let samples: DataObject<EnergyDataProcessed>[] = [];
    let idsToDelete: string[] = [];

    for (let energyMetaData of energyMetaDataSet) {
      // there is only one entry per stoneId
      monitor?.start(`Aggregate ${interval} ${energyMetaData.sphereId} ${energyMetaData.stoneId}`)
      await processor._processAggregations(energyMetaData.sphereId, energyMetaData.stoneId, intervalData, samples, idsToDelete, timezoneMap[energyMetaData.sphereId], monitor);
      monitor?.end();
    }

    if (samples.length > 0) {
      // console.log("Storing samples", samples)
      monitor?.start(`Storing samples for ${interval}: ${samples.length}`,'create-query');
      await Dbs.stoneEnergyProcessed.createAll(samples);
      monitor?.end();
    }
    if (idsToDelete.length > 0) {
      // console.log("deleting samples")
      monitor?.start(`Deleting samples for ${interval}: ${samples.length}`, 'delete-query');
      await Dbs.stoneEnergyProcessed.deleteAll({id: {inq: idsToDelete}});
      monitor?.end();
    }
  }

  if (metaData) {
    metaData.timestamp = new Date();
    await Dbs.metaData.update(metaData)
  }
  else {
    await Dbs.metaData.create({type:"aggregationTime", timestamp: new Date()});
  }

  console.log(JSON.stringify(monitor?.getAverageTimes('query'), null, 2));
  monitor?.destroy()
}







