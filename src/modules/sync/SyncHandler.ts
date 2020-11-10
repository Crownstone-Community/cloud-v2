import {Dbs} from "../containers/RepoContainer";
import {HttpErrors} from "@loopback/rest";
import {SyncRequestReply, SyncRequestReply_Sphere} from "../../declarations/syncTypes";
import {User} from "../../models/user.model";
import {Sphere} from "../../models/sphere.model";
import {req} from "crownstone-cloud/dist/util/request";
import {DataObject} from "@loopback/repository";
import {Hub} from "../../models/hub.model";

let FIELDS = [
  'sphere',
  {hubs:            ['hub']},
  {locations:       ['location', 'position']},
  {messages:        ['message']},
  {scenes:          ['scene']},
  {stones:          ['stone', {abilities: ['abilities','properties']},'behaviours']},
  {sortedLists:     ['sortedLists']},
  {sphereFeatures:  ['sphereFeatures']},
  {trackingNumbers: ['trackingNumbers']},
  {toons:           ['toons']},
]

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

interface idMap<T> {
  [id: string]: T
}

interface nestedIdMap<T> {
  [id: string]: {
    [id: string] : T
  }
}


class Syncer {

  async downloadAll(userId: string) {
    let user   = await Dbs.user.findById(userId);
    let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});

    let sphereIds = [];

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
    }

    // this is one way to query,
    let sphereData = await Dbs.sphere.find({
      where: {id: {inq: sphereIds }},
      include: [
        {relation:'features'},
        {relation:'locations', scope: {
          include: [
            {relation: 'sphereOverviewPosition'}
          ]}
        },
        {relation:'messages'},
        {relation:'hubs'},
        {relation:'scenes'},
        {relation:'sortedLists'},
        {relation:'stones', scope: {
          include: [
            {relation: 'behaviours'},
            {relation: 'abilities', scope: {include:[{relation:'properties'}]}},
            {relation: 'currentSwitchState'},
            {relation: 'location',  scope: {fields: {id:true, name: true} }}
          ]}
        },
        {relation:'trackingNumbers'},
        {relation:'toons'},
      ]
    });


    function injectSphereSimpleItem(sphere: Sphere, key: string, singular: string, sphereItem: any) {
      // @ts-ignore
      if (sphere[key] !== undefined) {
        sphereItem[key] = {};
        // @ts-ignore
        for (let i = 0; i < sphere[key].length; i++) {
          // @ts-ignore
          let item = sphere[key][i];
          sphereItem[key][item.id] = {[singular]: {status: "VIEW", data: item}};
        }
      }
    }

    function parseSphere(sphere: Sphere) : SyncRequestReply_Sphere {

      let sphereItem : SyncRequestReply_Sphere = { sphere: { status: "VIEW", data: {}}};
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
      injectSphereSimpleItem(sphere, 'messages',        'message',        sphereItem);
      injectSphereSimpleItem(sphere, 'scenes',          'scene',          sphereItem);
      injectSphereSimpleItem(sphere, 'sortedLists',     'sortedList',     sphereItem);
      injectSphereSimpleItem(sphere, 'trackingNumbers', 'trackingNumber', sphereItem);
      injectSphereSimpleItem(sphere, 'toons',           'toon',           sphereItem);

      if (sphere['locations'] !== undefined) {
        sphereItem['locations'] = {};
        for (let i = 0; i < sphere['locations'].length; i++) {
          let location = sphere['locations'][i];
          let locationData = {...location};
          delete locationData['sphereOverviewPosition'];
          sphereItem['locations'][location.id] = { data: {status: "VIEW", data: locationData}, };
          if (location['sphereOverviewPosition']) {
            // @ts-ignore
            sphereItem['locations'][location.id]["position"] = {status: "VIEW", data: location['sphereOverviewPosition']};
          }
        }
      }

      if (sphere['stones'] !== undefined) {
        sphereItem['stones'] = {};
        for (let i = 0; i < sphere['stones'].length; i++) {
          let stone = {...sphere['stones'][i]};
          let stoneData = {...stone};
          delete stoneData['abilities'];
          delete stoneData['behaviours'];

          sphereItem['stones'][stone.id] = {
            data: {status: "VIEW", data: stoneData},
          };

          if (stone['behaviours']) {
            // @ts-ignore
            sphereItem['stones'][stone.id]["behaviours"] = {};
            for (let j = 0; j < stone.behaviours.length; j++) {
              let behaviour = stone.behaviours[j];
              // @ts-ignore
              sphereItem['stones'][stone.id]["behaviours"][behaviour.id] = { behaviour: {status: "VIEW", data: behaviour }}
            }
          }

          if (stone['abilities']) {
            // @ts-ignore
            sphereItem['stones'][stone.id]["abilities"] = {};
            for (let j = 0; j < stone.abilities.length; j++) {
              let ability = stone.abilities[j];
              let abilityData = {...ability};
              delete abilityData.properties;
              // @ts-ignore
              sphereItem['stones'][stone.id]["abilities"][ability.id] = { ability: {status: "VIEW", data: abilityData }};

              if (ability['properties']) {
                // @ts-ignore
                sphereItem['stones'][stone.id]["abilities"][ability.id]["properties"] = {};
                for (let k = 0; k < ability.properties.length; k++) {
                  let property = ability.properties[k];
                  // @ts-ignore
                  sphereItem['stones'][stone.id]["abilities"][ability.id]["properties"][property.id] = { status: "VIEW", data: property };
                }
              }
            }
          }
        }
      }

      return sphereItem;
    }


    let result : SyncRequestReply = {
      user: { status: "VIEW", data: user },
      spheres: {},
    };
    for (let i = 0; i < sphereData.length; i++) {
      result.spheres[sphereData[i].id] = parseSphere(sphereData[i])
    }

    return result;
  }


  async requestSync(userId: string, dataStructure: SyncRequest) {
    let filterFields = {id: true, updatedAt:true};
    let user   = await Dbs.user.findById(userId, {fields: filterFields});
    let access = await Dbs.sphereAccess.find({where: {userId: userId}});

    let sphereIds = [];

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
    }

    let sphereData = await Dbs.sphere.find({where: {id: {inq: sphereIds }},fields: filterFields})

    // We do this in separate queries since Loopback also makes it separate queries and the fields filter for id an updated at true does
    // not work in the scope {}. It only supports fields filter where we remove fields.
    sphereIds = getIds(sphereData);
    let filter = {where: {sphereId: {inq: sphereIds }},fields: filterFields};

    let featureData         = await Dbs.sphereFeature.find(filter);
    let locationData        = await Dbs.location.find(filter);
    let positionData        = await Dbs.position.find(filter);

    let messageData         = await Dbs.message.find(filter);
    let messageIds          = getIds(messageData);
    let messageStateData    = await Dbs.messageState.find({where: {messageDeliveredId: {inq: messageIds }},fields: filterFields});
    let messageUserData     = await Dbs.messageUser.find( {where:  {messageId: {inq: messageIds }},fields: filterFields});

    let hubData             = await Dbs.hub.find(filter);
    let sceneData           = await Dbs.scene.find(filter);
    let sortedListData      = await Dbs.sortedList.find(filter);

    let stoneData           = await Dbs.stone.find(filter);
    let stoneIds            = getIds(stoneData);
    let behaviourData       = await Dbs.stoneBehaviour.find({where:  {stoneId: {inq: stoneIds }},fields: filterFields})
    let abilityData         = await Dbs.stoneAbility.find({where:  {stoneId: {inq: stoneIds }},fields: filterFields})
    let abilityIds          = getIds(abilityData);
    let abilityPropertyData = await Dbs.stoneAbilityProperty.find({where:  {abilityId: {inq: abilityIds }},fields: filterFields})

    let trackingNumberData  = await Dbs.sphereTrackingNumber.find(filter);
    let toonData            = await Dbs.toon.find(filter);

    let cloud_spheres         = getUniqueIdMap(sphereData);
    let cloud_features        = getNestedIdMap(featureData,           'sphereId');
    let cloud_locations       = getNestedIdMap(locationData,          'sphereId');
    let cloud_position        = getNestedIdMap(positionData,          'locationId');
    let cloud_messages        = getNestedIdMap(messageData,           'sphereId');
    let cloud_messageStatesD  = getNestedIdMap(messageStateData,      'messageDeliveredId');
    let cloud_messageStatesR  = getNestedIdMap(messageStateData,      'messageReadId');
    let cloud_messageUsers    = getNestedIdMap(messageUserData,       'messageId');
    let cloud_hubs            = getNestedIdMap(hubData,               'sphereId');
    let cloud_scenes          = getNestedIdMap(sceneData,             'sphereId');
    let cloud_sortedLists     = getNestedIdMap(sortedListData,        'sphereId');
    let cloud_stones          = getNestedIdMap(stoneData,             'sphereId');
    let cloud_behaviours      = getNestedIdMap(behaviourData,         'stoneId');
    let cloud_abilities       = getNestedIdMap(abilityData,           'stoneId');
    let cloud_abilityProperties  = getNestedIdMap(abilityPropertyData,'abilityId');
    let cloud_trackingNumbers = getNestedIdMap(trackingNumberData,    'sphereId');
    let cloud_toons           = getNestedIdMap(toonData,              'sphereId');

    let reply : SyncRequestReply = {spheres:{}};

    async function processSphereCollection<T extends UpdatedAt>(sphereId: string, fieldname: SyncCategories, cloud_items_in_sphere : idMap<T> = {}) {
      let reqSphere = dataStructure.spheres[sphereId];
      
      // if there is no item in the cloud, cloud_hubs can be undefined.
      let cloudItemIds = Object.keys(cloud_items_in_sphere);
      if (reqSphere[fieldname]) {
        // we will first iterate over all hubs in the user request.
        // this handles:
        //  - user has one more than cloud (new)
        //  - user has synced data, or user has data that has been deleted.
        let clientItemIds = Object.keys(reqSphere[fieldname]);
        for (let j = 0; j < clientItemIds.length; j++) {
          let itemId = clientItemIds[j];
          let clientItem = reqSphere[fieldname][itemId];
          if (clientItem.new) {
            // create hub in cloud.
            try {
              let newItem = await Dbs.hub.create({...clientItem.data, sphereId: sphereId});
              reply.spheres[sphereId][fieldname][itemId] = { data: { status: "CREATED_IN_CLOUD", data: newItem }}
            }
            catch (e) {
              reply.spheres[sphereId][fieldname][itemId] = { data: { status: "ERROR", error: {code:0, msg: e} }}
            }
          }
          else {
            reply.spheres[sphereId][fieldname][itemId] = { data: getReply(clientItem, cloud_items_in_sphere[itemId]) }
          }
        }

        // now we will iterate over all hubs in the cloud
        // this handles:
        //  - cloud has hub that the user does not know.
        for (let j = 0; j < cloudItemIds.length; j++) {
          let cloudItemId = cloudItemIds[j];
          if (reqSphere[fieldname] && reqSphere[fieldname][cloudItemId] === undefined) {
            reply.spheres[sphereId][fieldname][cloudItemId] = { data: getReply(null, cloud_items_in_sphere[cloudItemId]) };
          }
        }
      }
      else {
        // there are no hubs for the user, give the user all the hubs.
        for (let j = 0; j < cloudItemIds.length; j++) {
          let cloudItemId = cloudItemIds[j];
          reply.spheres[sphereId][fieldname][cloudItemId] = { data: getReply(null, cloud_items_in_sphere[cloudItemId]) };
        }
      }
    }

    // first we check the users
    if (dataStructure.user) {
      reply.user = getShallowReply(dataStructure.user, user)
    }
    
    if (dataStructure.spheres) {
      let requestSphereIds = Object.keys(dataStructure.spheres);
      for (let i = 0; i < requestSphereIds.length; i++) {
        let sphereId = requestSphereIds[i];
        let reqSphere = dataStructure.spheres[sphereId];
        reply.spheres[sphereId] = {};
        reply.spheres[sphereId].sphere = getShallowReply(reqSphere.data, cloud_spheres[sphereId]);

        await processSphereCollection(sphereId, 'hubs',            cloud_hubs[sphereId])
        await processSphereCollection(sphereId, 'features',        cloud_features[sphereId])
        await processSphereCollection(sphereId, 'scenes',          cloud_scenes[sphereId])
        await processSphereCollection(sphereId, 'sortedLists',     cloud_sortedLists[sphereId])
        await processSphereCollection(sphereId, 'trackingNumbers', cloud_trackingNumbers[sphereId])
        await processSphereCollection(sphereId, 'toons',           cloud_toons[sphereId])



        

      }
    }

    


    console.log(JSON.stringify(sphereData, undefined, 2))
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
      return this.downloadAll(userId)
    }

    // Full is used on login and is essentially a partial dump for your user
    if (dataStructure.sync.type === "FULL") {
      return this.downloadAll(userId);
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

function getUniqueIdMap<T>(list: T[], idField: string = 'id') : idMap<T> {
  let result: idMap<T> = {};
  for (let i = 0; i < list.length; i++) {
    // @ts-ignore
    let requestedId = list[i][idField];
    result[requestedId] = list[i];
  }
  return result;
}

function getNestedIdMap<T>(list: T[], idField: string) : nestedIdMap<T> {
  let result: { [id: string]: T[] } = {};
  for (let i = 0; i < list.length; i++) {
    // @ts-ignore
    let requestedId = list[i][idField];
    if (result[requestedId] === undefined) {
      result[requestedId] = [];
    }
    result[requestedId].push(list[i]);
  }
  let masterKeys = Object.keys(result);
  let nestedResult: nestedIdMap<T> = {};
  for (let i = 0; i < masterKeys.length; i++) {
    let mk = masterKeys[i];
    nestedResult[mk] = getUniqueIdMap(result[mk]);
  }

  return nestedResult;
}



function getIds(collection: any[]) : string[] {
  let ids = [];
  for (let i = 0; i < collection.length; i++) { ids.push(collection[i].id); }
  return ids;
}



function getShallowReply<T extends UpdatedAt>(requestObject: UpdatedAt, cloudEntity: T | null) : { status: SyncState, data?: DataObject<T>} {
  if (!cloudEntity) {
    return { status: "DELETED" }
  }
  else {
    return getReplyBasedOnTime<T>(requestObject.updatedAt, cloudEntity.updatedAt, cloudEntity)
  }
}


function getReply<T extends UpdatedAt>(requestObject: RequestItemCoreType | null | undefined, cloudEntity: T | null | undefined) : { status: SyncState, data?: DataObject<T>} {
  if (!cloudEntity) {
    if (requestObject.new) {
      throw "New should have been handled before.";
    }
    else {
      return { status: "DELETED" }
    }
  }
  else if (!requestObject) {
    return { status:"NEW_DATA_AVAILABLE", data: cloudEntity };
  }
  else {
    return getReplyBasedOnTime<T>(requestObject.data.updatedAt, cloudEntity.updatedAt, cloudEntity)
  }
}

function getReplyBasedOnTime<T extends UpdatedAt>(request : Date | number | string, cloud : Date | number | string, cloudEntity: T) : { status: SyncState, data?: DataObject<T>} {
  let requestT = getTimestamp(request);
  let cloudT   = getTimestamp(cloud);

  if (requestT === cloudT) {
    return { status: "IN_SYNC"};
  }
  else if (requestT < cloudT) {
    return { status: "NEW_DATA_AVAILABLE", data: cloudEntity };
  }
  else {
    return { status: "REQUEST_DATA"};
  }
}

function getTimestamp(a : Date | number | string) : number {
  let at
  if (typeof a === 'string') {
    at = new Date(a).valueOf();
  }
  else if (a instanceof Date) {
    at = a.valueOf();
  }
  else {
    at = a;
  }
  return at;
}



export const SyncHandler = new Syncer();

// // if there is no hub in the cloud, cloud_hubs can be undefined.
// let cloud_hubs_in_sphere = cloud_hubs[sphereId] ?? {};
// let cloudHubIds = Object.keys(cloud_hubs_in_sphere);
// if (reqSphere.hubs) {
//   // we will first iterate over all hubs in the user request.
//   // this handles:
//   //  - user has one more than cloud (new)
//   //  - user has synced data, or user has data that has been deleted.
//   let hubIds = Object.keys(reqSphere.hubs);
//   for (let j = 0; j < hubIds.length; j++) {
//     let hubId = hubIds[j];
//     let clientHub = reqSphere.hubs[hubId];
//     if (clientHub.new) {
//       // create hub in cloud.
//       try {
//         let newHub = await Dbs.hub.create({...clientHub.data, sphereId: sphereId});
//         reply.spheres[sphereId].hubs[hubId] = { data: { status: "CREATED_IN_CLOUD", data: newHub }}
//       }
//       catch (e) {
//         reply.spheres[sphereId].hubs[hubId] = { data: { status: "ERROR", error: {code:0, msg: e} }}
//       }
//     }
//     else {
//       reply.spheres[sphereId].hubs[hubId] = { data: getReply(clientHub, cloud_hubs_in_sphere[hubId]) }
//     }
//   }
//
//   // now we will iterate over all hubs in the cloud
//   // this handles:
//   //  - cloud has hub that the user does not know.
//   for (let j = 0; j < cloudHubIds.length; j++) {
//     let cloudHubId = cloudHubIds[j];
//     if (reqSphere.hubs && reqSphere.hubs[cloudHubId] === undefined) {
//       reply.spheres[sphereId].hubs[cloudHubId] = { data: getReply(null, cloud_hubs_in_sphere[cloudHubId]) };
//     }
//   }
// }
// else {
//   // there are no hubs for the user, give the user all the hubs.
//   for (let j = 0; j < cloudHubIds.length; j++) {
//     let cloudHubId = cloudHubIds[j];
//     reply.spheres[sphereId].hubs[cloudHubId] = { data: getReply(null, cloud_hubs_in_sphere[cloudHubId]) };
//   }
// }