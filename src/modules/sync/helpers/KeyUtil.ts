import {constants} from "../../../constants/keys";
import {Dbs} from "../../containers/RepoContainer";
import {UserKeys, UserKeySet} from "../../../declarations/syncTypes";
import {SphereAccess} from "../../../models/sphere-access.model";
import {getNestedIdArray} from "./SyncUtil";


const MEMBER_ACCESS = {
  [constants.KEY_TYPES.MEMBER_KEY] : true,
  [constants.KEY_TYPES.BASIC_KEY] : true,
  [constants.KEY_TYPES.LOCALIZATION_KEY] : true,
  [constants.KEY_TYPES.SERVICE_DATA_KEY] : true,
};
const GUEST_ACCESS = {
  [constants.KEY_TYPES.BASIC_KEY] : true,
  [constants.KEY_TYPES.LOCALIZATION_KEY] : true,
  [constants.KEY_TYPES.SERVICE_DATA_KEY] : true,
};

export async function getEncryptionKeys(userId: string, sphereId?: string, stoneId?: string, userAccess?: SphereAccess[]) : Promise<UserKeySet> {
  if (!userAccess) {
    let queryArray : any[] = [{userId: userId}, {invitePending: {neq: true}}];
    if (sphereId) {
      queryArray.push({sphereId: sphereId})
    }
    userAccess = await Dbs.sphereAccess.find({where: {and: queryArray}})
  }

  let result : UserKeySet = [];

  let sphereIds = [];
  for (let i = 0; i < userAccess.length; i++) {
    let sphereAccess = userAccess[i];
    if (sphereAccess && sphereAccess.role) {
      sphereIds.push(sphereAccess.sphereId);
    }
  }

  let sphereKeys = await Dbs.sphereKeys.find({where: {sphereId: { inq:sphereIds }}} );
  let stoneKeys  = await Dbs.stoneKeys.find( {where: {sphereId: { inq:sphereIds }}} );

  let access_map     = getNestedIdArray(userAccess, 'sphereId');
  let sphereKeys_map = getNestedIdArray(sphereKeys, 'sphereId');
  let stoneKeys_map  = getNestedIdArray(stoneKeys,  'sphereId');

  for (let i = 0; i < sphereIds.length; i++) {
    let sphereId = sphereIds[i];
    let sphereAccess = access_map[sphereId][0]
    let sphereResult : UserKeys = {
      sphereId: sphereId,
      sphereAuthorizationToken: sphereAccess.sphereAuthorizationToken,
      sphereKeys: [],
      stoneKeys:  {},
    };
    switch (sphereAccess.role) {
      case "admin":
        // gets netkey, appkey, servicedatakey, adminkey, memberkey, basickey and all stone keys.
        sphereResult.sphereKeys = sphereKeys_map[sphereId];
        let stoneKeys_map_inSphere = getNestedIdArray(stoneKeys_map[sphereId], 'stoneId');
        sphereResult.stoneKeys = stoneKeys_map_inSphere;
        break;
      case "member":
        for (let j = 0; j < sphereKeys_map[sphereId].length; j++) {
          let sphereKey = sphereKeys_map[sphereId][j];
          if (MEMBER_ACCESS[sphereKey.keyType]) {
            sphereResult.sphereKeys.push(sphereKey);
          }
        }
        break;
      case "guest":
      case "basic":
        for (let j = 0; j < sphereKeys_map[sphereId].length; j++) {
          let sphereKey = sphereKeys_map[sphereId][j];
          if (GUEST_ACCESS[sphereKey.keyType]) {
            sphereResult.sphereKeys.push(sphereKey);
          }
        }
        break;
    }
    result.push(sphereResult);
  }

  return result;
};
