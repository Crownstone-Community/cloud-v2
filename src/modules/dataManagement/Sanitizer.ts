import {Dbs} from "../containers/RepoContainer";
import {AccessLevels} from "../../models/sphere-access.model";


export class DataSanitizer {


  static async sanitize() {
    let beginTime = Date.now();

    let users                         = await Dbs.user.find({fields: {id: true, profilePicId: true}})
    let userIds                       = await idArray(new Promise((resolve, reject) => { resolve(users); }));
    let userImageIds                  = await idArray(new Promise((resolve, reject) => { resolve(users); }), 'profilePicId');

    // @ts-ignore
    let deletedExpiredTokenCount      = await deleteGetCount(Dbs.crownstoneToken,{expiredAt: {lt: Date.now()}});
    let deletedOrphanedTokenCount     = await deleteGetCount(Dbs.crownstoneToken,{userId: {nin: userIds}, principalType:"user"});
    let deletedOauthTokenCount        = await deleteGetCount(Dbs.oauthToken,      {userId: {nin: userIds}});

    let deletedDevicesCount           = await deleteGetCount(Dbs.device,{ownerId: {nin: userIds}});
    let existingDeviceIds             = await idArray(Dbs.device.find({fields:{id:true}}));

    let deletedDeviceLocationsCount   = await deleteGetCount(Dbs.deviceLocationMap,{deviceId: {nin: existingDeviceIds}});
    let deletedDeviceSphereCount      = await deleteGetCount(Dbs.deviceSphereMap,  {deviceId: {nin: existingDeviceIds}});
    let deletedAppInstallationCount   = await deleteGetCount(Dbs.appInstallation,  {deviceId: {nin: existingDeviceIds}});
    let deletedPreferencesCount       = await deleteGetCount(Dbs.devicePreferences,{deviceId: {nin: existingDeviceIds}});
    let deletedFingerprintLinksCount  = await deleteGetCount(Dbs.fingerprintLinker,{deviceId: {nin: existingDeviceIds}});

    let linkedFingerprintIds          = await idArray(Dbs.fingerprintLinker.find({fields:{fingerprintId:true}}), 'fingerprintId');
    let deletedFingerprintCount       = await deleteGetCount(Dbs.fingerprint,{id: {nin: linkedFingerprintIds}});
    let deletedSphereAccessCount      = await deleteGetCount(Dbs.sphereAccess,{userId: {nin: userIds}, role:{neq:AccessLevels.hub}});

    let spheresWithOwnerIds           = await idArray(Dbs.sphereAccess.find({where: {role:{neq:AccessLevels.hub}}, fields: {sphereId: true}}), 'sphereId')
    let deletedSphereCount            = await deleteGetCount(Dbs.sphere,{id: {nin: spheresWithOwnerIds}});
    let deletedSceneCount             = await deleteGetCount(Dbs.scene,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedLocationsCount         = await deleteGetCount(Dbs.location,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedStoneCount             = await deleteGetCount(Dbs.stone,{sphereId: {nin: spheresWithOwnerIds}});

    let stoneIds                      = await idArray(Dbs.stone.find({fields:{id: true}}));
    let sphereIds                     = await idArray(Dbs.sphere.find({fields:{id: true}}));
    let deletedOrphanedSphereAccessCount = await deleteGetCount(Dbs.sphereAccess,{sphereId: {nin: sphereIds}});

    let deletedStoneBehavioursCount   = await deleteGetCount(Dbs.stoneBehaviour,{stoneId: {nin: stoneIds}});
    let deletedStoneAbilitiesCount    = await deleteGetCount(Dbs.stoneAbility,{stoneId: {nin: stoneIds}});
    let deletedStoneAbilityPropsCount = await deleteGetCount(Dbs.stoneAbilityProperty,{stoneId: {nin: stoneIds}});
    let deletedSwitchStateCount       = await deleteGetCount(Dbs.stoneSwitchState,{stoneId: {nin: stoneIds}});
    let deletedStoneKeysCount         = await deleteGetCount(Dbs.stoneKeys,{stoneId: {nin: stoneIds}});

    let deletedHubCount               = await deleteGetCount(Dbs.hub,{sphereId: {nin: spheresWithOwnerIds}});

    let existingHubIds                = await idArray(Dbs.hub.find({fields:{id:true}}))
    let deletedOrphanedHubTokenCount  = await deleteGetCount(Dbs.crownstoneToken,{userId: {nin: existingHubIds}, principalType:"Hub"});
    let deletedSphereAccessHubCount   = await deleteGetCount(Dbs.sphereAccess,{userId: {nin: existingHubIds}, role:AccessLevels.hub});

    let deletedSphereKeyCount         = await deleteGetCount(Dbs.sphereKeys,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedMessagesV2Count            = await deleteGetCount(Dbs.messageV2,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedMessagesRecipientUserCount = await deleteGetCount(Dbs.messageRecipientUser,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedMessagesReadByUserCount    = await deleteGetCount(Dbs.messageReadByUser,   {sphereId: {nin: spheresWithOwnerIds}});
    let deletedMessagesDeleteByUserCount  = await deleteGetCount(Dbs.messageDeletedByUser,{sphereId: {nin: spheresWithOwnerIds}});

    let deletedMessagesCount          = await deleteGetCount(Dbs.message,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedMessagesStateCount     = await deleteGetCount(Dbs.messageState,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedMessagesUserCount      = await deleteGetCount(Dbs.messageUser,{sphereId: {nin: spheresWithOwnerIds}});

    let deletedToonCount              = await deleteGetCount(Dbs.toon,{sphereId: {nin: spheresWithOwnerIds}});
    let deletedSphereTrackingNrCount  = await deleteGetCount(Dbs.sphereTrackingNumber,{sphereId: {nin: spheresWithOwnerIds}});

    let sceneImageIds                 = await idArray(Dbs.scene.find({fields:{customPictureId: true}}),'customPictureId');
    let locationIds                   = await idArray(Dbs.location.find({fields:{imageId: true}}),'imageId');

    let allFileIds = userImageIds.concat(sceneImageIds, locationIds);

    let deletedFsFileCount            = await deleteGetCount(Dbs.fsFiles,{id: {nin: allFileIds}});
    let deletedFsChunksCount          = await deleteGetCount(Dbs.fsChunks,{files_id: {nin: allFileIds}});

    let sanitationResult = {
      tokens: {
        crownstoneTokens: deletedOrphanedTokenCount + deletedExpiredTokenCount + deletedOrphanedHubTokenCount,
        oauthTokens: deletedOauthTokenCount,
      },
      devices: {
        devices: deletedDevicesCount,
        deviceLocationsMap: deletedDeviceLocationsCount,
        deviceSphereMap: deletedDeviceSphereCount,
        appInstallations: deletedAppInstallationCount,
        preferences: deletedPreferencesCount,
        fingerprintLinks: deletedFingerprintLinksCount
      },
      fingerprints: deletedFingerprintCount,
      spheres: {
        access: { users: deletedSphereAccessCount, hubs: deletedSphereAccessHubCount, spheres: deletedOrphanedSphereAccessCount},
        spheres: deletedSphereCount,
        locations: deletedLocationsCount,
        scenes: deletedSceneCount,
        hubs: deletedHubCount,
        stones: {
          stones: deletedStoneCount,
          behaviours: deletedStoneBehavioursCount,
          abilities: deletedStoneAbilitiesCount,
          abilityProperties: deletedStoneAbilityPropsCount,
          switchStates: deletedSwitchStateCount,
          keys: deletedStoneKeysCount
        },
        sphereKeys: deletedSphereKeyCount,
        messages: {
          messages:               deletedMessagesCount,
          messageStates:          deletedMessagesStateCount,
          messageUsers:           deletedMessagesUserCount,
          messagesV2:             deletedMessagesV2Count,
          messagesRecipientUsers: deletedMessagesRecipientUserCount,
          messagesReadByUsers:    deletedMessagesReadByUserCount,
          messagesDeleteByUsers:  deletedMessagesDeleteByUserCount,
        },
        toons: deletedToonCount,
        trackingNumbers: deletedSphereTrackingNrCount
      },
      files: {
        files: deletedFsFileCount,
        chunks: deletedFsChunksCount
      }
    };



    let duration = Date.now() - beginTime;
    console.log("Sanitation: Sanitation took",duration,"ms and deleted", getTotalCount(sanitationResult), "entries.");
    console.log("Sanitation: Deleted items per segment:\n", JSON.stringify(sanitationResult, null, 2));

    return sanitationResult;
  }

  /**
   * -delete expired Crownstone tokens
   *
   * -get userIds
   * -delete Crownstone tokens   with missing userIds
   * delete OAuth      tokens   with missing userIds
   * -delete devices             with missing userIds
   * -   delete device location map with missing deviceIds
   * -   delete device sphere map   with missing deviceIds
   * -   delete appInstallations    with missing deviceIds
   * -   delete preferences         with missing deviceIds
   * -   delete fingerprint linkes  with missing deviceIds
   * -   delete fingerprints which are not linked
   *
   * -get sphereAccess with missing userIds delete them (which are USERS, not HUBS)
   * -get spheres not in sphereAccess       delete them
   *
   * -get scenes    with missing sphereId delete custom images, delete them
   * -get locations with missing sphereId delete custom images, delete them
   * -get stones    with missing sphereId delete them
   *    -delete behaviours with missing stoneIds
   *    -delete abilities with missing stoneIds
   *    -delete abilityProperties with missing stoneIds
   *    -delete switchState with missing stoneIds
   *    -delete stoneKeys with missing stoneIds
   * -delete hubs                    with missing sphereIds
   * -delete sphereKeys              with missing sphereIds
   * delete messages                with missing sphereIds
   * delete messages-state          with missing sphereIds
   * delete messages-user           with missing sphereIds
   * (delete sphere-features         with missing sphereIds) -- not used at the moment
   * -delete toons                   with missing sphereIds
   * delete sphere-tracking numbers with missing sphereIds
   *
   * GridFS
   *  gather all fileIds from scenes, locations, users and delete the files that do not exist
   */
}

async function deleteGetCount(model: any, query: any) : Promise<number> {
  let modelName = model.constructor.name;
  let startTime = Date.now();
  let count = (await model.deleteAll(query)).count;
  let duration = Date.now() - startTime;
  console.log("Sanitation: Deleting", count, "items from", modelName, "took", duration, "ms");
  return count;
}


function pureMap(dataArray: any[], key = 'id') : Record<string, true> {
  let data : Record<string, true> = {};
  for (let point of dataArray) {
    if (point[key]) {
      data[point[key]] = true;
    }
  }
  return data
}

async function map(promise: Promise<any>, key = 'id') : Promise<Record<string, true>> {
  let dataArray = await promise;
  return pureMap(dataArray,key)
}

async function idArray(promise: Promise<any>, key = 'id') : Promise<string[]> {
  return Object.keys(await map(promise, key));
}


function getTotalCount(sanitationResult: any) : number {
  let total = 0;
  for (let item in sanitationResult) {
    if (typeof sanitationResult[item] !== "number") {
      total += getTotalCount(sanitationResult[item]);
    }
    else {
      total += sanitationResult[item];
    }
  }
  return total;
}
