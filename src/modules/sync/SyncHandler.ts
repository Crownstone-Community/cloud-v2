import {Dbs} from "../containers/RepoContainer";
import {HttpErrors} from "@loopback/rest";
import {SyncRequestReply, SyncRequestReply_Sphere} from "../../declarations/syncTypes";
import {Sphere} from "../../models/sphere.model";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";
import {fillSyncStoneData, markStoneChildrenAsNew} from "./helpers/StoneSyncHelpers";
import {processSyncCollection} from "./helpers/SyncHelpers";
import {getReply, getShallowReply} from "./helpers/ReplyHelpers";
import {
  getIds,
  getNestedIdMap,
  getSyncIgnoreList,
  getUniqueIdMap
} from "./helpers/SyncUtil";

let sphereRelationsMap : {[id:string]:boolean} = {
  features:        true,
  messages:        true,
  hubs:            true,
  scenes:          true,
  sortedLists:     true,
  trackingNumbers: true,
  toons:           true,
  locations:       true,
  stones:          true,
}

class Syncer {

  /**
   * This downloads everything in the required sphere.
   * @param sphereId
   * @param status
   */
  async downloadSphere(sphereId: string, status: SyncState, ignore: SyncIgnoreList) : Promise<SyncRequestReply_Sphere> {
    let includeArray = [];

    if (!ignore.features) {
      includeArray.push({relation:'features'});
    }
    if (!ignore.locations) {
      includeArray.push({relation:'locations'});
    }
    if (!ignore.messages) {
      includeArray.push({relation:'messages'});
    }
    if (!ignore.hubs) {
      includeArray.push({relation:'hubs'});
    }
    if (!ignore.scenes) {
      includeArray.push({relation:'scenes'});
    }
    if (!ignore.stones) {
      includeArray.push({relation:'stones', scope: {
          include: [
            {relation: 'behaviours'},
            {relation: 'abilities', scope: {include:[{relation:'properties'}]}},
            {relation: 'currentSwitchState'},
            {relation: 'location',  scope: {fields: {id:true, name: true} }}
          ]}
      });
    }
    if (!ignore.trackingNumbers) {
      includeArray.push({relation:'trackingNumbers'});
    }
    if (!ignore.toons) {
      includeArray.push({relation:'toons'});
    }


    let sphereData = await Dbs.sphere.findById(sphereId,{include: includeArray });


    function injectSphereSimpleItem(sphere: Sphere, key: SyncCategory, singularLabel: string, sphereItem: any) {
      // @ts-ignore
      if (sphere[key] !== undefined) {
        sphereItem[key] = {};
        // @ts-ignore
        for (let i = 0; i < sphere[key].length; i++) {
          // @ts-ignore
          let item = sphere[key][i];
          sphereItem[key][item.id] = {[singularLabel]: {status: status, data: item}};
        }
      }
    }

    function parseSphere(sphere: Sphere) : SyncRequestReply_Sphere {

      let sphereItem : SyncRequestReply_Sphere = { sphere: { status: status, data: {}}};
      let sphereKeys = Object.keys(sphere);
      for (let i = 0; i < sphereKeys.length; i++) {
        let key = sphereKeys[i];
        if (sphereRelationsMap[key] === undefined) {
          // @ts-ignore
          sphereItem.sphere.data[key] = sphere[key];
        }
      }
      injectSphereSimpleItem(sphere, 'hubs',            'hub',            sphereItem);
      injectSphereSimpleItem(sphere, 'features',        'feature',        sphereItem);
      // injectSphereSimpleItem(sphere, 'messages',        'message',        sphereItem);
      injectSphereSimpleItem(sphere, 'locations',       'location',       sphereItem);
      injectSphereSimpleItem(sphere, 'scenes',          'scene',          sphereItem);
      injectSphereSimpleItem(sphere, 'trackingNumbers', 'trackingNumber', sphereItem);
      injectSphereSimpleItem(sphere, 'toons',           'toon',           sphereItem);


      if (sphere.stones !== undefined) {
        sphereItem.stones = {};
        for (let i = 0; i < sphere.stones.length; i++) {
          let stone = {...sphere.stones[i]};
          let stoneData = {...stone};
          delete stoneData['abilities'];
          delete stoneData['behaviours'];

          sphereItem.stones[stone.id] = {
            data: {status: status, data: stoneData},
          };
          let stoneReply = sphereItem.stones[stone.id];

          if (stone.behaviours) {
            stoneReply.behaviours = {};
            for (let j = 0; j < stone.behaviours.length; j++) {
              let behaviour = stone.behaviours[j];
              stoneReply.behaviours[behaviour.id] = { data: {status: status, data: behaviour }}
            }
          }

          if (stone.abilities) {
            stoneReply.abilities = {};
            for (let j = 0; j < stone.abilities.length; j++) {
              let ability = stone.abilities[j];
              let abilityData = {...ability};
              delete abilityData.properties;
              stoneReply.abilities[ability.id] = { data: { status: status, data: abilityData }};

              if (ability.properties) {
                // @ts-ignore
                stoneReply.abilities[ability.id].properties = {};
                for (let k = 0; k < ability.properties.length; k++) {
                  let property = ability.properties[k];
                  // @ts-ignore
                  stoneReply.abilities[ability.id].properties[property.id] = { status: status, data: property };
                }
              }
            }
          }
        }
      }

      return sphereItem;
    }

    return parseSphere(sphereData);
  }


  /**
   * This does a full grab of all syncable data the user has access to.
   * @param userId
   */
  async downloadAll(userId: string, dataStructure: SyncRequest) {
    let ignore = getSyncIgnoreList(dataStructure.sync.scope);

    let user   = await Dbs.user.findById(userId);
    let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});

    let result : SyncRequestReply = {
      user: { status: "VIEW", data: user },
      spheres: {},
    };

    for (let i = 0; i < access.length; i++) {
      let sphereId = access[i].sphereId;
      result.spheres[sphereId] = await this.downloadSphere(sphereId, "VIEW", ignore);
    }

    return result;
  }


  async requestSync(userId: string, dataStructure: SyncRequest) : Promise<SyncRequestReply> {
    let ignore = getSyncIgnoreList(dataStructure.sync.scope);

    // this has the list of all required connection ids as wel as it's own ID and the updatedAt field.
    let filterFields = {
      id: true,
      updatedAt:true,
      sphereId: true,
      messageDeliveredId: true,
      messageId: true,
      stoneId: true,
      abilityId: true
    };
    let user   = await Dbs.user.findById(userId, {fields: filterFields});
    let access = await Dbs.sphereAccess.find({where: {userId: userId}});

    let sphereIds = [];

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
    }

    let sphereData = await Dbs.sphere.find({where: {id: {inq: sphereIds }},fields: filterFields})

    // We do this in separate queries since Loopback also makes it separate queries and the fields filter for id an updated at true does
    // not work in the scope {}. It only supports fields filter where we remove fields. Go figure...

    // this list *should* be the same as the one we got from the access, but since this is a cheap check, we make sure we only query the
    // rest of the database for the spheres that we actually got back.
    sphereIds = getIds(sphereData);
    let filter = {where: {sphereId: {inq: sphereIds }},fields: filterFields};

    let featureData         = ignore.features ? [] : await Dbs.sphereFeature.find(filter);
    let locationData        = ignore.features ? [] : await Dbs.location.find(filter);

    let messageData         = ignore.features ? [] : await Dbs.message.find(filter);
    let messageStateData    = ignore.features ? [] : await Dbs.messageState.find(filter);
    let messageUserData     = ignore.features ? [] : await Dbs.messageUser.find( filter);

    let hubData             = ignore.hubs   ? [] : await Dbs.hub.find(filter);
    let sceneData           = ignore.scenes ? [] : await Dbs.scene.find(filter);

    let stoneData           = ignore.stones ? [] : await Dbs.stone.find(filter);
    let behaviourData       = ignore.stones ? [] : await Dbs.stoneBehaviour.find(filter)
    let abilityData         = ignore.stones ? [] : await Dbs.stoneAbility.find(filter)
    let abilityPropertyData = ignore.stones ? [] : await Dbs.stoneAbilityProperty.find(filter)

    let trackingNumberData  = ignore.trackingNumbers ? [] : await Dbs.sphereTrackingNumber.find(filter);
    let toonData            = ignore.toons           ? [] : await Dbs.toon.find(filter);


    // this is cheap to do with empty arrays do we dont check for ignore here.
    let cloud_spheres         = getUniqueIdMap(sphereData);
    let cloud_features        = getNestedIdMap(featureData,           'sphereId');
    let cloud_locations       = getNestedIdMap(locationData,          'sphereId');

    // TODO: do something with messages.
    let cloud_messages        = getNestedIdMap(messageData,           'sphereId');
    let cloud_messageStatesD  = getNestedIdMap(messageStateData,      'messageDeliveredId');
    let cloud_messageStatesR  = getNestedIdMap(messageStateData,      'messageReadId');
    let cloud_messageUsers    = getNestedIdMap(messageUserData,       'messageId');

    let cloud_hubs            = getNestedIdMap(hubData,               'sphereId');
    let cloud_scenes          = getNestedIdMap(sceneData,             'sphereId');
    let cloud_stones          = getNestedIdMap(stoneData,             'sphereId');
    let cloud_behaviours      = getNestedIdMap(behaviourData,         'stoneId');
    let cloud_abilities       = getNestedIdMap(abilityData,           'stoneId');
    let cloud_abilityProperties  = getNestedIdMap(abilityPropertyData,'abilityId');
    let cloud_trackingNumbers = getNestedIdMap(trackingNumberData,    'sphereId');
    let cloud_toons           = getNestedIdMap(toonData,              'sphereId');

    let reply : SyncRequestReply = {spheres:{}};



    // first we check the users
    if (dataStructure.user) {
      reply.user = await getShallowReply(dataStructure.user, user, () => { return Dbs.user.findById(userId)})
    }
    
    if (dataStructure.spheres) {
      let requestSphereIds = Object.keys(dataStructure.spheres);
      for (let i = 0; i < requestSphereIds.length; i++) {
        let sphereId = requestSphereIds[i];
        let requestSphere = dataStructure.spheres[sphereId];
        reply.spheres[sphereId] = {};
        reply.spheres[sphereId].sphere = await getShallowReply(requestSphere.data, cloud_spheres[sphereId], () => { return Dbs.sphere.findById(sphereId) });
        let replySphere = reply.spheres[sphereId];

        if (!ignore.hubs) {
          await processSyncCollection('hubs', Dbs.hub, {sphereId}, requestSphere, replySphere, cloud_hubs[sphereId]);
        }
        if (!ignore.features) {
          await processSyncCollection('features',        Dbs.sphereFeature,        {sphereId}, requestSphere, replySphere, cloud_features[sphereId]);
        }
        if (!ignore.locations) {
          await processSyncCollection('locations',       Dbs.location,             {sphereId}, requestSphere, replySphere, cloud_locations[sphereId]);
        }
        if (!ignore.scenes) {
          await processSyncCollection('scenes',          Dbs.scene,                {sphereId}, requestSphere, replySphere, cloud_scenes[sphereId]);
        }
        if (!ignore.trackingNumbers) {
          await processSyncCollection('trackingNumbers', Dbs.sphereTrackingNumber, {sphereId}, requestSphere, replySphere, cloud_trackingNumbers[sphereId]);
        }
        if (!ignore.toons) {
          await processSyncCollection('toons', Dbs.toon, {sphereId}, requestSphere, replySphere, cloud_toons[sphereId]);
        }


        if (!ignore.stones) {
          // if there is no item in the cloud, cloud_hubs can be undefined.
          let cloud_stones_in_sphere = cloud_stones[sphereId] || {};
          let cloudStoneIds = Object.keys(cloud_stones_in_sphere);
          replySphere.stones = {};
          if (requestSphere.stones) {
            // we will first iterate over all hubs in the user request.
            // this handles:
            //  - user has one more than cloud (new)
            //  - user has synced data, or user has data that has been deleted.
            let clientStoneIds = Object.keys(requestSphere.stones);
            for (let j = 0; j < clientStoneIds.length; j++) {
              let stoneId = clientStoneIds[j];
              let stoneCloudId = clientStoneIds[j];
              let clientStone = requestSphere.stones[stoneId];
              if (clientStone.new) {
                // propegate new to behaviour and to abilities in case the user forgot to mark all children as new too.
                markStoneChildrenAsNew(clientStone);

                // create stone in cloud.
                try {
                  let newItem = await Dbs.stone.create({...clientStone.data, sphereId: sphereId});
                  stoneCloudId = newItem.id;
                  replySphere.stones[stoneId] = { data: { status: "CREATED_IN_CLOUD", data: newItem }}
                }
                catch (e) {
                  replySphere.stones[stoneId] = { data: { status: "ERROR", error: {code:0, msg: e} }}
                }
              }
              else {
                replySphere.stones[stoneId] = { data: await getReply(clientStone, cloud_stones_in_sphere[stoneId], () => { return Dbs.stone.findById(stoneCloudId) }) }
              }

              await processSyncCollection(
                'behaviours',
                Dbs.stoneBehaviour,
                {stoneId: stoneCloudId, sphereId},
                clientStone,
                replySphere.stones[stoneId],
                cloud_behaviours[stoneId]
              );

              async function syncClientAbilityProperties(abilityReply : any, clientAbility: any, abilityId: string, abilityCloudId: string) : Promise<void> {
                await processSyncCollection(
                  'properties',
                  Dbs.stoneAbilityProperty,
                  {stoneId: stoneCloudId, sphereId, abilityId: abilityCloudId},
                  clientAbility,
                  abilityReply[abilityId],
                  cloud_abilityProperties[abilityId]
                )
              }

              async function syncCloudAbilityProperties(abilityReply: any, cloudAbility: StoneAbility, abilityId : string) : Promise<void> {
                if (cloudAbility.properties) {
                  let abilityPropertyIds = Object.keys(cloudAbility.properties);
                  for (let l = 0; l < abilityPropertyIds.length; l++) {
                    let abilityPropertyId = abilityPropertyIds[l];
                    abilityReply.properties[abilityPropertyId] = {data: await getReply(null, cloud_abilityProperties[abilityId][abilityPropertyId], () => { return Dbs.stoneAbilityProperty.findById(abilityPropertyId); })}
                  }
                }
              }

              await processSyncCollection(
                'abilities',
                Dbs.stoneAbility,
                {stoneId: stoneCloudId, sphereId},
                clientStone,
                replySphere.stones[stoneId],
                cloud_abilities[stoneId],
                syncClientAbilityProperties,
                syncCloudAbilityProperties,
                (ability) => {
                  if (ability.properties) {
                    let propertyIds = Object.keys(ability.properties);
                    for ( let k = 0; k < propertyIds.length; k++) { ability.properties[propertyIds[k]].new = true; }
                  }
                }
              );
            }

            // now we will iterate over all stones in the cloud
            // this handles:
            //  - cloud has stone that the user does not know.
            for (let j = 0; j < cloudStoneIds.length; j++) {
              let cloudStoneId = cloudStoneIds[j];
              if (requestSphere.stones && requestSphere.stones[cloudStoneId] === undefined) {
                let stoneReply = reply.spheres[sphereId].stones[cloudStoneId] = {};
                await fillSyncStoneData(stoneReply, cloudStoneId, cloud_stones_in_sphere[cloudStoneId], cloud_behaviours, cloud_abilities, cloud_abilityProperties);
              }
            }
          }
          else {
            // there are no stones for the user, give the user all the stones.
            for (let j = 0; j < cloudStoneIds.length; j++) {
              let cloudStoneId = cloudStoneIds[j];
              let stoneReply = reply.spheres[sphereId].stones[cloudStoneId] = {};
              await fillSyncStoneData(stoneReply, cloudStoneId, cloud_stones_in_sphere[cloudStoneId], cloud_behaviours, cloud_abilities, cloud_abilityProperties);
            }
          }
        }
      }


      // now we will iterate over all spheres in the cloud
      // this handles:
      //  - cloud has sphere that the user does not know.
      for (let i = 0; i < sphereIds.length; i++) {
        let cloudSphereId = sphereIds[i];
        if (dataStructure.spheres[cloudSphereId] === undefined) {
          reply.spheres[cloudSphereId] = await this.downloadSphere(cloudSphereId, "NEW_DATA_AVAILABLE", ignore);
        }
      }
    }
    else {
      // there are no spheres for the user, give the user all the spheres.
      for (let i = 0; i < sphereIds.length; i++) {
        let cloudSphereId = sphereIds[i];
        reply.spheres[cloudSphereId] = await this.downloadSphere(cloudSphereId, "NEW_DATA_AVAILABLE", ignore);
      }
    }

    return reply;
  }











  /**
   * This method will receive the initial sync request payload.
   *
   *
   * @param userId
   * @param dataStructure
   */
  async handleSync(userId: string, dataStructure: SyncRequest) : Promise<any | SyncRequestReply> {
    if (!dataStructure || Object.keys(dataStructure).length === 0) {
      throw new HttpErrors.BadRequest("No sync information provided.");
    }

    // Full is used on login and is essentially a partial dump for your user
    if (dataStructure.sync.type === "FULL") {
      return this.downloadAll(userId, dataStructure);
    }
    // Request is the first part of a real sync operation.
    else if (dataStructure.sync.type === "REQUEST") {
      // the user has sent a list of ids and updated at times. This should be the full set of what the user has
      // the cloud will query all ids that the user has access to including their updated at times.
      // there are 2 edge cases:
      //    1 - The user has an extra id: an entity has been created and not synced to the cloud yet.
      //            SOLUTION: It will be marked with new: true. The user knows that this is new since the user does not have a cloudId
      //    2 - The cloud has an id less: another user has deleted an entity from the cloud and this user doesnt know it yet.
      //            SOLUTION: the cloud marks this id as DELETED
      // If we want to only query items that are newer, we would not be able to differentiate between deleted and updated.
      // To allow for this optimization, we should keep a deleted event.
      return this.requestSync(userId, dataStructure);
    }
    else if (dataStructure.sync.type === "REPLY") {
      // this phase will provide the cloud with ids and data. The cloud has requested this, we update the models with the new data.
      // this returns a simple 200 {status: "OK"} or something
    }
    else {
      throw new HttpErrors.BadRequest("Sync type required. Must be either REQUEST REPLY or FULL")
    }



    // let syncData = dataStructure.sync;
    let userSync = dataStructure.user;
    if (!userSync) {
      throw new HttpErrors.BadRequest("User entry required.");
    }



    // if (dataStructure)
    // let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});



  }

  async replyPhase(userId: string) {

  }

}



export const SyncHandler = new Syncer();
