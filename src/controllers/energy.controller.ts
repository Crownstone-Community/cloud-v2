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
  @authorize(Authorization.sphereAdmin())
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

    let pointsToStore = [];
    for (let usage of energyUsage) {
      if (stoneIds[usage.stoneId] !== true) { continue; }
      pointsToStore.push({stoneId: usage.stoneId, sphereId: sphereId, timestamp: usage.timestamp, energyUsage: usage.energyUsage});
    }

    await Dbs.stoneEnergy.createAll(pointsToStore);

    let processor = new EnergyDataProcessor();
    await processor.processMeasurements(sphereId);

    return {message: "Energy usage stored", count: pointsToStore.length};
  }


  // Allow the collection of power data
  @get('/spheres/{id}/energyUsage')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async getEnergyUsage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @param.query.dateTime('date') date: Date,
    @param.query.string('range') range: 'day' | 'week' | 'month' | 'year',
  ): Promise<EnergyDataProcessed[]> {

    if (range === "day") {
      let start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      let end   = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
      return await Dbs.stoneEnergyProcessed.find({where: {sphereId: sphereId, and:[{timestamp: {gte: start}}, {timestamp: {lt: end}}], interval: '1h'}, fields:['stoneId', 'energyUsage', 'timestamp', 'interval']} );
    }

    if (range === 'week') {
      // get the monday of the week of the date as start and a week later as end
      let start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay()+6)%7);
      let end   = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);

      return await Dbs.stoneEnergyProcessed.find({where: {sphereId: sphereId, and:[{timestamp: {gte: start}}, {timestamp: {lt: end}}], interval: '1d'}, fields:['stoneId', 'energyUsage', 'timestamp', 'interval']});
    }

    if (range === 'month') {
      let start = new Date(date.getFullYear(), date.getMonth(), 1);
      let end   = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      return await Dbs.stoneEnergyProcessed.find({where: {sphereId: sphereId, and:[{timestamp: {gte: start}}, {timestamp: {lt: end}}], interval: '1d'}, fields:['stoneId', 'energyUsage', 'timestamp', 'interval']});
    }

    if (range === 'year') {
      let start = new Date(date.getFullYear(), 0, 1);
      let end   = new Date(date.getFullYear() + 1, 0, 1);

      return await Dbs.stoneEnergyProcessed.find({where: {sphereId: sphereId, and:[{timestamp: {gte: start}}, {timestamp: {lt: end}}], interval: '1M'}, fields:['stoneId', 'energyUsage', 'timestamp', 'interval']});
    }

    throw new HttpErrors.BadRequest("Invalid string for \"range\", should be one of these: day, week, month, year");
  }


  // Allow the collection of power data
  @del('/stones/{id}/energyUsage')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAdmin("Stone"))
  async deleteEnergyUsage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')    stoneId: string,
    @param.query.dateTime('from')   fromDate: Date,
    @param.query.dateTime('until')  untilDate: Date,
  ): Promise<Count> {

    let count          = await Dbs.stoneEnergy.deleteAll({stoneId: stoneId, and: [{timestamp: {gte: fromDate}}, {timestamp: {lt: untilDate}}]});
    let processedCount = await Dbs.stoneEnergyProcessed.deleteAll({stoneId: stoneId, timestamp: {gte: fromDate, lt: untilDate}});

    return {count: count.count + processedCount.count};
  }





}
