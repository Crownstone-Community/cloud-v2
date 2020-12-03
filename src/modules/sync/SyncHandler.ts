import {Dbs} from "../containers/RepoContainer";
import {HttpErrors, param} from "@loopback/rest";
import {SyncRequestReply, SyncRequestReply_Sphere} from "../../declarations/syncTypes";
import {Sphere} from "../../models/sphere.model";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";
import {fillSyncStoneData, markStoneChildrenAsNew} from "./helpers/StoneSyncHelpers";
import {processSyncCollection} from "./helpers/SyncHelpers";
import {getReply, getShallowReply} from "./helpers/ReplyHelpers";
import {
  filterForAppVersion, getHighestVersionPerHardwareVersion,
  getIds,
  getNestedIdMap,
  getSyncIgnoreList,
  getUniqueIdMap, sortByHardwareVersion
} from "./helpers/SyncUtil";
import {User} from "../../models/user.model";
import { hardwareVersions } from '../../constants/hardwareVersions';
import {Bootloader } from "../../models/bootloader.model";
import {Firmware} from "../../models/firmware.model";
import {getEncryptionKeys} from "./helpers/KeyUtil";
import {processSyncReply} from "./helpers/SyncReplyHelper";
import {EventHandler} from "../sse/EventHandler";
import {StoneBehaviour} from "../../models/stoneSubModels/stone-behaviour.model";
import {StoneAbilityProperty} from "../../models/stoneSubModels/stone-ability-property.model";
import {Hub} from "../../models/hub.model";
import {SphereFeature} from "../../models/sphere-feature.model";
import {Scene} from "../../models/scene.model";
import {Location} from "../../models/location.model";
import {Toon} from "../../models/toon.model";
import {SphereTrackingNumber} from "../../models/sphere-tracking-number.model";
import {EventLocationCache, EventSphereCache, EventStoneCache} from "../sse/events/EventConstructor";
import {DataObject} from "@loopback/repository";
import {Stone} from "../../models/stone.model";


const admin  = true;
const member = true;
const guest  = true;
const hub    = true;

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
  async downloadSphere(sphereId: string, status: SyncState, ignore: SyncIgnoreMap) : Promise<SyncRequestReply_Sphere> {
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

    let sphereData = await Dbs.sphere.findById(sphereId,{include: includeArray});

    function injectSphereSimpleItem(sphere: Sphere, key: SyncCategory, sphereItem: any) {
      // @ts-ignore
      if (sphere[key] !== undefined) {
        sphereItem[key] = {};
        // @ts-ignore
        for (let i = 0; i < sphere[key].length; i++) {
          // @ts-ignore
          let item = sphere[key][i];
          sphereItem[key][item.id] = {data: {status: status, data: item}};
        }
      }
    }

    function parseSphere(sphere: Sphere) : SyncRequestReply_Sphere {
      let sphereItem : SyncRequestReply_Sphere = {};
      if (!ignore.spheres) {
        sphereItem = { data: { status: status, data: {}}};
      }

      let sphereKeys = Object.keys(sphere);
      for (let i = 0; i < sphereKeys.length; i++) {
        let key = sphereKeys[i];
        if (!ignore.spheres && sphereRelationsMap[key] === undefined) {
          // @ts-ignore
          sphereItem.data.data[key] = sphere[key];
        }
      }
      injectSphereSimpleItem(sphere, 'hubs',            sphereItem);
      injectSphereSimpleItem(sphere, 'features',        sphereItem);
      injectSphereSimpleItem(sphere, 'messages',        sphereItem);
      injectSphereSimpleItem(sphere, 'locations',       sphereItem);
      injectSphereSimpleItem(sphere, 'scenes',          sphereItem);
      injectSphereSimpleItem(sphere, 'trackingNumbers', sphereItem);
      injectSphereSimpleItem(sphere, 'toons',           sphereItem);


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


  async getBootloaders(userId: string, request: SyncRequest, user?: User) {
    if (!user) {
      user = await Dbs.user.findById(userId, {fields: {earlyAccessLevel: true}});
    }

    let appVersion = request?.sync?.appVersion ?? null;
    let hwVersions = hardwareVersions.util.getAllVersions();
    let accessLevel = user.earlyAccessLevel;
    let results = await Dbs.bootloader.find({where: {releaseLevel: {lte: accessLevel }}})
    let filteredResults : Bootloader[] = filterForAppVersion(results, appVersion);

    // generate a map of all bootloaders per hardware version.
    let bootloaderForHardwareVersions : {[hwVersion:string]: Bootloader[] } = sortByHardwareVersion(hwVersions, filteredResults)

    // pick the highest version per hardware type.
    let highestBootloaderVersions = getHighestVersionPerHardwareVersion(hwVersions, bootloaderForHardwareVersions)

    return highestBootloaderVersions;
  }


  async getFirmwares(userId: string, request: SyncRequest, user?: User) {
    if (!user) {
      user = await Dbs.user.findById(userId, {fields: {earlyAccessLevel: true}});
    }

    let appVersion = request?.sync?.appVersion ?? null;
    let hwVersions = hardwareVersions.util.getAllVersions();
    let accessLevel = user.earlyAccessLevel;
    let results = await Dbs.firmware.find({where: {releaseLevel: {lte: accessLevel }}})
    let filteredResults : Firmware[] = filterForAppVersion(results, appVersion);

    // generate a map of all bootloaders per hardware version.
    let firmwareForHardwareVersions : {[hwVersion:string]: Firmware[] } = sortByHardwareVersion(hwVersions, filteredResults)

    // pick the highest version per hardware type.
    let highestFirmwareVersions = getHighestVersionPerHardwareVersion(hwVersions, firmwareForHardwareVersions)

    return highestFirmwareVersions;
  }

  /**
   * This does a full grab of all syncable data the user has access to.
   * @param userId
   */
  async downloadAll(userId: string, request: SyncRequest) {
    let ignore = getSyncIgnoreList(request.sync.scope);

    let reply : SyncRequestReply = {
      spheres: {},
    };


    let user : User;
    if (!ignore.user && !ignore.firmware && !ignore.bootloader) {
      user = await Dbs.user.findById(userId);
      reply.user = { status: "VIEW", data: user };
    }
    let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});



    for (let i = 0; i < access.length; i++) {
      let sphereId = access[i].sphereId;
      reply.spheres[sphereId] = await this.downloadSphere(sphereId, "VIEW", ignore);
    }

    if (!ignore.firmware)   { reply.firmwares   = {status: "VIEW", ...await this.getFirmwares(  userId, request, user)}; }
    if (!ignore.bootloader) { reply.bootloaders = {status: "VIEW", ...await this.getBootloaders(userId, request, user)}; }
    if (!ignore.keys)       { reply.keys = await getEncryptionKeys(userId, null, null, access); }

    return reply;
  }


  async handleRequestSync(userId: string, request: SyncRequest) : Promise<SyncRequestReply> {
    let ignore = getSyncIgnoreList(request.sync.scope);

    // this has the list of all required connection ids as wel as it's own ID and the updatedAt field.
    let filterFields = {
      id:                 true,
      earlyAccessLevel:   true, // used for bootloaders and firmwares.
      updatedAt:          true,
      sphereId:           true,
      messageDeliveredId: true,
      messageId:          true,
      stoneId:            true,
      abilityId:          true
    };

    let access = await Dbs.sphereAccess.find({where: {userId: userId, invitePending: {neq: true}}});
    let sphereIds = [];
    let accessMap : {[sphereId: string]: ACCESS_ROLE} = {};

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
      accessMap[access[i].sphereId] = access[i].role as ACCESS_ROLE;
    }

    let sphereData = await Dbs.sphere.find({where: {id: {inq: sphereIds}},fields: filterFields})

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

    let hubData             = ignore.hubs     ? [] : await Dbs.hub.find(filter);
    let sceneData           = ignore.scenes   ? [] : await Dbs.scene.find(filter);

    let stoneData           = ignore.stones   ? [] : await Dbs.stone.find(filter);
    let behaviourData       = ignore.stones   ? [] : await Dbs.stoneBehaviour.find(filter)
    let abilityData         = ignore.stones   ? [] : await Dbs.stoneAbility.find(filter)
    let abilityPropertyData = ignore.stones   ? [] : await Dbs.stoneAbilityProperty.find(filter)

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

    let user : User;
    if (!ignore.user && !ignore.firmware && !ignore.bootloader) {
      user       = await Dbs.user.findById(userId, {fields: filterFields});
      reply.user = await getShallowReply(request.user, user, () => { return Dbs.user.findById(userId)})
    }

    if (request.spheres) {
      let requestSphereIds = Object.keys(request.spheres);
      for (let i = 0; i < requestSphereIds.length; i++) {
        let sphereId = requestSphereIds[i];
        let requestSphere = request.spheres[sphereId];
        reply.spheres[sphereId] = {};
        if (!ignore.spheres) {
          reply.spheres[sphereId].data = await getShallowReply(requestSphere.data, cloud_spheres[sphereId], () => {
            return Dbs.sphere.findById(sphereId)
          });
        }
        else {
          if (!cloud_spheres[sphereId]) {
            reply.spheres[sphereId].data = {status: "NOT_AVAILABLE"};
          }
        }

        let replySphere = reply.spheres[sphereId];

        if (replySphere?.data?.status === 'NOT_AVAILABLE') {
          continue;
        }

        let accessRole = accessMap[sphereId];

        if (!ignore.hubs) {
          await processSyncCollection('hubs',      Dbs.hub,          {sphereId}, requestSphere, replySphere,
            accessRole,{admin}, {admin}, cloud_hubs[sphereId],
            (hub: Hub) => {
              // TODO: create hub event
            });
        }
        if (!ignore.features) {
          await processSyncCollection('features',  Dbs.sphereFeature,{sphereId}, requestSphere, replySphere,
            accessRole,{},{}, cloud_features[sphereId],
            (feature: SphereFeature) => { /** do nothing, this is not allowed to be set with sync **/ });
        }
        if (!ignore.locations) {
          await processSyncCollection('locations', Dbs.location,     {sphereId}, requestSphere, replySphere,
            accessRole,{admin, member},{admin, member},  cloud_locations[sphereId],
            (location: Location) => {
            EventHandler.dataChange.sendLocationCreatedEventBySphereId(sphereId, location);
          });
        }
        if (!ignore.scenes) {
          await processSyncCollection('scenes',    Dbs.scene,        {sphereId}, requestSphere, replySphere,
            accessRole,{admin, member},{admin, member}, cloud_scenes[sphereId],
            (scene: Scene) => {
            // TODO: create scene event
            });
        }
        if (!ignore.toons) {
          await processSyncCollection('toons',     Dbs.toon,         {sphereId}, requestSphere, replySphere,
            accessRole,{admin},{admin, member}, cloud_toons[sphereId],
            (toon: Toon) => { });
        }
        if (!ignore.trackingNumbers) {
          await processSyncCollection(
            'trackingNumbers',
            Dbs.sphereTrackingNumber,
            {sphereId}, requestSphere, replySphere,
            accessRole,
            {admin, member, guest},
             {admin, member, guest},
            cloud_trackingNumbers[sphereId],
            (trackingNumber: SphereTrackingNumber) => {
              // TODO: create trackingNumber event
            }
          );
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
                if (accessRole !== "admin") {
                  replySphere.stones[stoneId] = { data: { status: "ACCESS_DENIED" } };
                  continue;
                }
                // propegate new to behaviour and to abilities in case the user forgot to mark all children as new too.
                markStoneChildrenAsNew(clientStone);

                // create stone in cloud.
                try {
                  let newStone = await Dbs.stone.create({...clientStone.data, sphereId: sphereId});
                  stoneCloudId = newStone.id;
                  EventHandler.dataChange.sendStoneCreatedEventBySphereId(sphereId, newStone);
                  replySphere.stones[stoneId] = { data: { status: "CREATED_IN_CLOUD", data: newStone }}
                }
                catch (e) {
                  replySphere.stones[stoneId] = { data: { status: "ERROR", error: {code: e?.statusCode ?? 0, msg: e} }}
                }
              }
              else {
                replySphere.stones[stoneId] = { data: await getReply(clientStone, cloud_stones_in_sphere[stoneId], () => { return Dbs.stone.findById(stoneCloudId) }) }
                if (replySphere.stones[stoneId].data.status === "NOT_AVAILABLE") {
                  continue;
                }
                else if (replySphere.stones[stoneId].data.status === "REQUEST_DATA" && accessRole === 'guest') {
                  replySphere.stones[stoneId].data.status = "IN_SYNC";
                }
              }

              await processSyncCollection(
                'behaviours',
                Dbs.stoneBehaviour,
                {stoneId: stoneCloudId, sphereId},
                clientStone,
                replySphere.stones[stoneId],
                accessRole,
                {admin, member, hub},
                {admin, member, hub},
                cloud_behaviours[stoneId],
                (behaviour: StoneBehaviour) => {
                  if (clientStone.new) { return; }
                  // TODO: create behaviour create event
                },
              );

              async function syncClientAbilityProperties(abilityReply : any, clientAbility: any, abilityId: string, abilityCloudId: string) : Promise<void> {
                if (abilityReply[abilityId].data.status === "NOT_AVAILABLE") {
                  return;
                }
                await processSyncCollection(
                  'properties',
                  Dbs.stoneAbilityProperty,
                  {stoneId: stoneCloudId, sphereId, abilityId: abilityCloudId},
                  clientAbility,
                  abilityReply[abilityId],
                  accessRole,
                  {admin, member, hub},
                  {admin, member, hub},
                  cloud_abilityProperties[abilityId],
                  (abilityProperty: StoneAbilityProperty) => {
                    if (clientStone.new || clientAbility.new) { return; }
                    // TODO: create ability property create event
                    EventHandler.dataChange.sendAbilityChangeEventByIds(sphereId, stoneId, clientAbility);
                  },
                )
              }

              async function syncCloudAbilityProperties(abilityReply: any, cloudAbilityProperties: StoneAbility, abilityId : string) : Promise<void> {
                let properties = cloud_abilityProperties[abilityId];

                if (properties) {
                  abilityReply.properties = {};
                  let abilityPropertyIds = Object.keys(properties || {});
                  for (let l = 0; l < abilityPropertyIds.length; l++) {
                    let abilityPropertyId = abilityPropertyIds[l];
                    abilityReply.properties[abilityPropertyId] = {data: await getReply(null, properties[abilityPropertyId], () => { return Dbs.stoneAbilityProperty.findById(abilityPropertyId); })}
                  }
                }
              }

              await processSyncCollection(
                'abilities',
                Dbs.stoneAbility,
                {stoneId: stoneCloudId, sphereId},
                clientStone,
                replySphere.stones[stoneId],
                accessRole,
                {admin, member},
                {admin, member},
                cloud_abilities[stoneId],
                (ability: StoneAbility) => {
                  if (clientStone.new) { return; }
                  EventHandler.dataChange.sendAbilityChangeEventByParentIds(sphereId, stoneId, ability);
                },
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
        if (request.spheres[cloudSphereId] === undefined) {
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

    if (!ignore.firmware)   { reply.firmwares   = {status: "VIEW", ...await this.getFirmwares(  userId, request, user)}; }
    if (!ignore.bootloader) { reply.bootloaders = {status: "VIEW", ...await this.getBootloaders(userId, request, user)}; }
    if (!ignore.keys)       { reply.keys = await getEncryptionKeys(userId, null, null, access); }

    return reply;
  }


  async handleReplySync(userId: string, request: SyncRequest) {
    let ignore = getSyncIgnoreList(request.sync.scope);

    let access = await Dbs.sphereAccess.find({where: {userId: userId, invitePending: {neq: true}}});
    let sphereIds = [];
    let accessMap: { [sphereId: string]: ACCESS_ROLE } = {};

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
      accessMap[access[i].sphereId] = access[i].role as ACCESS_ROLE;
    }

    let reply : SyncRequestReply = {spheres:{}};

    if (request.user) {
      try {
        await Dbs.user.updateById(userId, request.user, {acceptTimes: true});
        reply.user = {status: "UPDATED_IN_CLOUD"};
      }
      catch (e) {
        reply.user = {status: "ERROR", error: {code: e?.statusCode ?? 0, msg: e}};
      }
    }

    if (request.spheres) {
      let requestSphereIds = Object.keys(request.spheres);
      for (let i = 0; i < requestSphereIds.length; i++) {
        let sphereId = requestSphereIds[i];
        let accessRole = accessMap[sphereId];
        let requestSphere = request.spheres[sphereId];
        reply.spheres[sphereId] = {};
        let sphereReply = reply.spheres[sphereId];

        if (requestSphere.data) {
          // update model in cloud.
          if (accessRole !== 'admin' && accessRole !== 'member') {
            sphereReply.data = {status: "ACCESS_DENIED"};
          }
          else {
            try {
              await Dbs.sphere.updateById(sphereId, requestSphere.data, {acceptTimes: true});
              sphereReply.data = {status: "UPDATED_IN_CLOUD"};
              EventSphereCache.merge(sphereId, requestSphere.data);
              EventHandler.dataChange.sendSphereUpdatedEventBySphereId(sphereId);
            }
            catch (e) {
              sphereReply.data = {status: "ERROR", error: {code: e?.statusCode ?? 0, msg: e}};
            }
          }
        }

        await processSyncReply('hubs', Dbs.hub, requestSphere.hubs, sphereReply, accessRole, {admin},
       (hubId: string, hubData: Hub) => {
          // TODO: create update hub event
        });
        await processSyncReply('locations', Dbs.location, requestSphere.locations, sphereReply, accessRole, {admin, member},
          (locationId: string, locationData: Location) => {
            EventLocationCache.merge(locationId, locationData);
            EventHandler.dataChange.sendLocationUpdatedEventByIds(sphereId, locationId);
        });
        await processSyncReply('scenes', Dbs.scene, requestSphere.scenes, sphereReply, accessRole, {admin, member},
          (sceneId: string, sceneData: Scene) => {
            // TODO: create update scene event
        });
        await processSyncReply('toons', Dbs.toon, requestSphere.toons, sphereReply, accessRole, {admin},
          (toonId: string, toonData: Toon) => {
            // TODO: create update toon event
        });
        await processSyncReply('trackingNumbers', Dbs.sphereTrackingNumber, requestSphere.trackingNumbers, sphereReply, accessRole, {admin, member, guest},
          (trackingNumberId: string, trackingNumberData: SphereTrackingNumber) => {
            // TODO: create update trackingNumber event
        });

        const checkStones = async (stoneReply: any, stone: any, stoneId: string) => {
          const checkToUpdateAbilities = async (abilityReply: any, ability: any) => {
            await processSyncReply('properties', Dbs.stoneAbilityProperty, ability.properties, abilityReply, accessRole,{admin, member},
              (abilityPropertyId: string, abilityPropertyData: StoneAbilityProperty) => {
                // TODO: create update abilityProperty event
              });
          }
          await processSyncReply('abilities',  Dbs.stoneAbility,   stone.abilities, stoneReply, accessRole, {admin, member},
            (abilityId: string, abilityData: StoneAbility) => {
              EventHandler.dataChange.sendAbilityChangeEventByIds(sphereId, stoneId, abilityId);
            }, checkToUpdateAbilities);
          await processSyncReply('behaviours', Dbs.stoneBehaviour, stone.behaviour, stoneReply, accessRole, {admin, member},
            (behaviourId: string, behaviourData: StoneBehaviour) => {
              // TODO: create update trackingNumber event
            });
        }
        await processSyncReply('stones', Dbs.stone, requestSphere.stones, sphereReply, accessRole, {admin},
          (stoneId: string, stoneData: Stone) => {
            EventStoneCache.merge(stoneId, stoneData);
            EventHandler.dataChange.sendStoneUpdatedEventByIds(sphereId, stoneId);
          }, checkStones);
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
      //            SOLUTION: the cloud marks this id as NOT_AVAILABLE
      // If we want to only query items that are newer, we would not be able to differentiate between deleted and updated.
      // To allow for this optimization, we should keep a deleted event.
      return this.handleRequestSync(userId, dataStructure);
    }
    else if (dataStructure.sync.type === "REPLY") {
      // this phase will provide the cloud with ids and data. The cloud has requested this, we update the models with the new data.
      // this returns a simple 200 {status: "OK"} or something

      return this.handleReplySync(userId, dataStructure);
    }
    else {
      throw new HttpErrors.BadRequest("Sync type required. Must be either REQUEST REPLY or FULL")
    }
  }


}



export const SyncHandler = new Syncer();
