import {Dbs} from "../containers/RepoContainer";
import {AccessLevels, SphereAccess} from "../../models/sphere-access.model";


export class DataSanitizer {

  userIds: Record<string, boolean> = {};

  async sanitize() {
    let users      = await Dbs.user.find({fields: {id: true, profilePicId: true}})
    let userIds    = await idArray(new Promise((resolve, reject) => { resolve(users); }));
    let userImageIds = await idArray(new Promise((resolve, reject) => { resolve(users); }), 'profilePicId');

    // @ts-ignore
    let deletedTokenCount      = (await Dbs.crownstoneToken.deleteAll({expiredAt: {lt: Date.now()}})).count;
    let deletedOauthTokenCount = (await Dbs.oauthToken.deleteAll({userId: {nin: userIds}})).count;

    let deletedDevicesCount    = (await Dbs.device.deleteAll({ownerId: {nin: userIds}})).count;

    let existingDeviceIds      = await idArray(Dbs.device.find({fields:{id:true}}));

    let deletedDeviceLocationsCount  = (await Dbs.deviceLocationMap.deleteAll({deviceId: {nin: existingDeviceIds}})).count;
    let deletedDeviceSphereCount     = (await Dbs.deviceSphereMap.deleteAll(  {deviceId: {nin: existingDeviceIds}})).count;
    let deletedAppInstallationCount  = (await Dbs.appInstallation.deleteAll(  {deviceId: {nin: existingDeviceIds}})).count;
    let deletedPreferencesCount      = (await Dbs.devicePreferences.deleteAll({deviceId: {nin: existingDeviceIds}})).count;
    let deletedFingerprintLinksCount = (await Dbs.fingerprintLinker.deleteAll({deviceId: {nin: existingDeviceIds}})).count;

    let linkedFingerprintIds     = await idArray(Dbs.fingerprintLinker.find({fields:{fingerprintId:true}}), 'fingerprintId');
    let deletedFingerprintCount  = (await Dbs.fingerprint.deleteAll( {id: {nin: linkedFingerprintIds}})).count;
    let deletedSphereAccessCount = (await Dbs.sphereAccess.deleteAll({userId: {nin: userIds}, role:{neq:AccessLevels.hub}})).count;

    let spheresWithOwnerIds   = await idArray(Dbs.sphereAccess.find({where: {role:{neq:AccessLevels.hub}}, fields: {sphereId: true}}), 'sphereId')
    let deletedSphereCount    = (await Dbs.sphere.deleteAll({id: {nin: spheresWithOwnerIds}})).count;
    let deletedSceneCount     = (await Dbs.scene.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;
    let deletedLocationsCount = (await Dbs.location.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;
    let deletedStoneCount     = (await Dbs.stone.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;

    let stoneIds = await idArray(Dbs.stone.find({fields:{id: true}}));

    let deletedStoneBehavioursCount = (await Dbs.stoneBehaviour.deleteAll({stoneId: {nin: stoneIds}})).count;
    let deletedStoneAbilitiesCount  = (await Dbs.stoneAbility.deleteAll({stoneId: {nin: stoneIds}})).count;
    let deletedStoneAbilityPropertiesCount  = (await Dbs.stoneAbilityProperty.deleteAll({stoneId: {nin: stoneIds}})).count;
    let deletedSwitchStateCount     = (await Dbs.stoneSwitchState.deleteAll({stoneId:{nin:stoneIds}})).count;
    let deletedStoneKeysCount       = (await Dbs.stoneKeys.deleteAll({stoneId:{nin:stoneIds}})).count;

    let deletedHubCount             = (await Dbs.hub.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;

    let existingHubIds = await idArray(Dbs.hub.find({fields:{id:true}}))
    let deletedSphereAccessHubCount = (await Dbs.sphereAccess.deleteAll({userId: {nin: existingHubIds}, role:AccessLevels.hub})).count;

    let deletedSphereKeyCount       = (await Dbs.sphereKeys.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;
    let deletedMessagesCount        = (await Dbs.message.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;
    let deletedMessagesStateCount   = (await Dbs.messageState.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;
    let deletedMessagesUserCount    = (await Dbs.messageUser.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;

    let deletedToonCount            = (await Dbs.toon.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;
    let deletedSphereTrackingNumberCount = (await Dbs.sphereTrackingNumber.deleteAll({sphereId: {nin: spheresWithOwnerIds}})).count;

    let sceneImageIds = await idArray(Dbs.scene.find({fields:{customPictureId: true}}),'customPictureId');
    let locationIds   = await idArray(Dbs.location.find({fields:{imageId: true}}),'imageId');

    let allFileIds = userImageIds.concat(sceneImageIds, locationIds);


    let deletedFsFileCount   = (await Dbs.fsFiles.deleteAll({id: {nin: allFileIds}})).count;
    let deletedFsChunksCount = (await Dbs.fsChunks.deleteAll({files_id: {nin: allFileIds}})).count;

    return {
      tokens: {
        crownstoneTokens: deletedTokenCount,
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
        access: { users: deletedSphereAccessCount, hubs: deletedSphereAccessHubCount},
        spheres: deletedSphereCount,
        locations: deletedLocationsCount,
        scenes: deletedSceneCount,
        hubs: deletedHubCount,
        stones: {
          stones: deletedStoneCount,
          behaviours: deletedStoneBehavioursCount,
          abilities: deletedStoneAbilitiesCount,
          abilityProperties: deletedStoneAbilityPropertiesCount,
          switchStates: deletedSwitchStateCount,
          keys: deletedStoneKeysCount
        },
        sphereKeys: deletedSphereKeyCount,
        messages: {
          messages: deletedMessagesCount,
          messageStates: deletedMessagesStateCount,
          messageUsers: deletedMessagesUserCount,
        },
        toons: deletedToonCount,
        trackingNumbers: deletedSphereTrackingNumberCount
      },
      files: {
        files: deletedFsFileCount,
        chunks: deletedFsChunksCount
      }
    }
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