import {inject} from "@loopback/context";
import {SecurityBindings, UserProfile} from "@loopback/security";
import {del, get, getModelSchemaRef, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {Count, repository} from "@loopback/repository";
import {SphereRepository} from "../repositories/data/sphere.repository";
import {SphereItem} from "./support/SphereItem";
import {authorize} from "@loopback/authorization";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";
import {Dbs} from "../modules/containers/RepoContainer";
import {sphereFeatures} from "../enums";
import {EnergyDataProcessor} from "../modules/energy/EnergyProcessor";
import {EnergyUsageCollection} from "../models/endpointModels/energy-usage-collection.model";
import {EnergyDataProcessed} from "../models/stoneSubModels/stone-energy-data-processed.model";
import {Filter} from "@loopback/filter/src/query";
import {EnergyMetaData} from "../models/stoneSubModels/stone-energy-metadata.model";

const FOREVER = new Date('2100-01-01 00:00:00');

type storeReply = {
  message: string,
  count: number,
}

const energyUsageArray = {
  type: 'array',
  items: {
    'x-ts-type': EnergyUsageCollection,
  },
};

export class Energy extends SphereItem {
  authorizationModelName = "Sphere";

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @repository(SphereRepository) protected sphereRepo: SphereRepository,
  ) { super(); }



  // Allow the collection of power data
  @post('/spheres/{id}/energyUsageCollectionPermission')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAdmin())
  async setEnergyUsageCollectionPermission(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @param.query.boolean('permission') permission: boolean,
  ): Promise<void> {
    let currentState = await Dbs.sphereFeature.findOne({where:{name: sphereFeatures.ENERGY_COLLECTION_PERMISSION, sphereId: sphereId}});

    if (currentState === null) {
      if (permission === true) {
        await Dbs.sphereFeature.create({name: "ENERGY_COLLECTION_PERMISSION", sphereId: sphereId, enabled: true, from: new Date(), until: FOREVER});
      }
    }
    else {
      if (permission === false) {
        await Dbs.sphereFeature.deleteById(currentState.id);
        return;
      }
      else {
        if (currentState.enabled === false) {
          await Dbs.sphereFeature.updateById(currentState.id, {enabled: true, until: FOREVER});
          return;
        }

        // check if the permission is still valid.
        if (currentState.until < new Date()) {
          await Dbs.sphereFeature.updateById(currentState.id, {until: FOREVER});
          return;
        }
      }
    }
  }


  // Get the permission state of the collection of power data
  @get('/spheres/{id}/energyUsageCollectionPermission')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAccess())
  async energyUsageCollectionPermission(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
  ): Promise<boolean> {
    let currentState = await Dbs.sphereFeature.findOne({where:{name: sphereFeatures.ENERGY_COLLECTION_PERMISSION, sphereId: sphereId}});
    if (currentState === null) {
      return false;
    }

    // check if the permission is still valid.
    if (currentState.until < new Date()) {
      await Dbs.sphereFeature.deleteById(currentState.id);
      return false;
    }

    return currentState.enabled;
  }



  // Allow the collection of power data
  @post('/spheres/{id}/energyUsage')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAdminHub())
  async collectEnergyUsage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @requestBody.array(getModelSchemaRef(EnergyUsageCollection)) energyUsage: EnergyUsageCollection[]
  ): Promise<storeReply> {
    let currentState = await Dbs.sphereFeature.findOne({where:{name: sphereFeatures.ENERGY_COLLECTION_PERMISSION, sphereId: sphereId}});
    if (!currentState?.enabled) { throw new HttpErrors.Forbidden("Energy collection is not enabled for this sphere."); }

    let stoneIdArray = (await Dbs.stone.find({where: {sphereId: sphereId}, fields: {id: true}})).map((stone) => { return stone.id; });
    // create map from array
    let stoneIds : Record<string, true> = {};
    for (let id of stoneIdArray) { stoneIds[id] = true; }
    let stoneIdsThatHaveData : Record<string, true> = {};

    let pointsToStore = [];
    for (let usage of energyUsage) {
      if (stoneIds[usage.stoneId] !== true) { continue; }
      pointsToStore.push({stoneId: usage.stoneId, sphereId: sphereId, timestamp: usage.t, energyUsage: usage.energy});
      stoneIdsThatHaveData[usage.stoneId] = true;
    }

    await Dbs.stoneEnergy.createAll(pointsToStore);

    let processor = new EnergyDataProcessor();
    await processor.processMeasurements(sphereId);


    // update metadata fields
    if (pointsToStore.length > 0) {
      let result = await Dbs.stoneEnergyMetaData.updateAll({updatedAt: new Date()}, {stoneId: {inq: stoneIdArray}});
      let stoneIdsThatHaveDataArray = Object.keys(stoneIdsThatHaveData);
      // check if we have metadata for all stonesIds
      if (result.count !== stoneIdsThatHaveDataArray.length) {
        let metadata = await Dbs.stoneEnergyMetaData.find({where: {stoneId: {inq: stoneIdArray}}, fields:{stoneId: true}});
        let metaDataIdMap : Record<string, EnergyMetaData> = {};
        for (let meta of metadata) {
          metaDataIdMap[meta.stoneId] = meta;
        }
        let metadataToStore = [];
        for (let stoneId of stoneIdArray) {
          if (metaDataIdMap[stoneId] === undefined) {
            metadataToStore.push({stoneId: stoneId, sphereId: sphereId, updatedAt: new Date()});
          }
        }
        if (metadataToStore.length > 0) {
          await Dbs.stoneEnergyMetaData.createAll(metadataToStore);
        }
      }
    }

    return {message: "Energy usage stored", count: pointsToStore.length};
  }


  // Allow the collection of power data
  @get('/spheres/{id}/energyUsage')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async getEnergyUsage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')       sphereId: string,
    @param.query.dateTime('start') start:    Date,
    @param.query.dateTime('end')   end:      Date,
    @param.query.string('range')   range:    'day' | 'week' | 'month' | 'year',
  ): Promise<EnergyDataProcessed[]> {

    // just in case the values are not date objects but strings or timestamps.
    start = new Date(start);
    end   = new Date(end);

    // ensure we query on round, hourly values.
    start.setMinutes(0,0,0);
    end.setMinutes(0,0,0);

    if (start === end) { return []; }

    let fieldsAndOrder : Filter<EnergyDataProcessed> = {
      fields:['stoneId', 'energyUsage', 'timestamp'],
      order:['timestamp ASC']
    };
    let queryWhere = {
      sphereId,
      and:[{timestamp: {gte: start}}, {timestamp: {lte: end}}]
    };

    let interval : EnergyInterval = '1h';
    let duration = end.valueOf() - start.valueOf();
    let hour = 3600e3;
    switch (range) {
      case 'day':
        if (duration > 25 * hour) { throw new HttpErrors.BadRequest("Range is too large for day range."); }
        interval = '1h';
        break;
      case 'week':
        if (duration > 8 * 24 * hour) { throw new HttpErrors.BadRequest("Range is too large for week range."); }
        interval = '1d';
        break;
      case 'month':
        if (duration > 32 * 24 * hour) { throw new HttpErrors.BadRequest("Range is too large for month range."); }
        interval = '1d';
        break;
      case 'year':
        if (duration > 366 * 24 * hour) { throw new HttpErrors.BadRequest("Range is too large for year range."); }
        interval = '1M';
        break;
      default:
        throw new HttpErrors.BadRequest("Invalid string for \"range\", should be one of these: day, week, month, year");
    }

    let datapoints : any[] = await Dbs.stoneEnergyProcessed.find({where: {...queryWhere, interval}, ...fieldsAndOrder});

    // if we do not have a fully filled range, check if we have a pending unprocessed value which provides the most up-to-date data.
    let lastTimestamp = datapoints[datapoints.length-1]?.timestamp ?? start;

    // check if we need an additional point at the end.
    if (lastTimestamp < end) {
      // get a point for the next interval, even if it might be partial.
      let additionalPoint = await Dbs.stoneEnergy.findOne({
        where: {
          sphereId,
          checked: true,
          and:[{timestamp: {gt: lastTimestamp}}, {timestamp: {lte: end}}]
        },
        fields: ['stoneId', 'energyUsage', 'timestamp'],
        order:  ['timestamp DESC'],
      });

      if (additionalPoint) {
        datapoints.push({stoneId: additionalPoint.stoneId, energyUsage: additionalPoint.correctedEnergyUsage, timestamp: additionalPoint.timestamp});
      }
      else {
        let additionalPoint = await Dbs.stoneEnergyProcessed.findOne({
          where: {
            sphereId,
            and:[{timestamp: {gt: lastTimestamp}}, {timestamp: {lte: end}}]
          },
          fields: ['stoneId', 'energyUsage', 'timestamp'],
          order:  ['timestamp DESC'],
        });
        if (additionalPoint) {
          datapoints.push(additionalPoint);
        }
      }
    }

    // check if we need an additional point at the start.
    let firstTimestamp = datapoints[0]?.timestamp ?? end;
    if (firstTimestamp > start) {
      // get a point for the previous interval, even if it might be partial.
      let additionalPoint = await Dbs.stoneEnergy.findOne({
        where: {
          sphereId,
          checked: true,
          and:[{timestamp: {gte: start}}, {timestamp: {lt: firstTimestamp}}]
        },
        fields: ['stoneId', 'energyUsage', 'timestamp'],
        order:  ['timestamp ASC'],
      });

      if (additionalPoint) {
        datapoints.unshift({stoneId: additionalPoint.stoneId, energyUsage: additionalPoint.correctedEnergyUsage, timestamp: additionalPoint.timestamp});
      }
      else {
        let additionalPoint = await Dbs.stoneEnergyProcessed.findOne({
          where: {
            sphereId,
            and:[{timestamp: {gte: start}}, {timestamp: {lt: firstTimestamp}}]
          },
          fields: ['stoneId', 'energyUsage', 'timestamp'],
          order:  ['timestamp ASC'],
        });
        if (additionalPoint) {
          datapoints.unshift(additionalPoint);
        }
      }
    }

    return datapoints;
  }


  // Allow the collection of power data
  @del('/stones/{id}/energyUsage')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAdmin("Stone"))
  async deleteEnergyUsage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')    stoneId: string,
    @param.query.dateTime('start')   fromDate: Date,
    @param.query.dateTime('end')  untilDate: Date,
  ): Promise<Count> {

    let count          = await Dbs.stoneEnergy.deleteAll({stoneId: stoneId, and: [{timestamp: {gte: fromDate}}, {timestamp: {lt: untilDate}}]});
    let processedCount = await Dbs.stoneEnergyProcessed.deleteAll({stoneId: stoneId, timestamp: {gte: fromDate, lt: untilDate}});

    return {count: count.count + processedCount.count};
  }





}
