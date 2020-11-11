import {SyncReplyStone} from "../../../declarations/syncTypes";
import {Stone} from "../../../models/stone.model";
import {StoneBehaviour} from "../../../models/stoneSubModels/stone-behaviour.model";
import {StoneAbility} from "../../../models/stoneSubModels/stone-ability.model";
import {StoneAbilityProperty} from "../../../models/stoneSubModels/stone-ability-property.model";
import {Dbs} from "../../containers/RepoContainer";
import {getReply} from "./ReplyHelpers";


/**
 * This function just gets new stone data from the cloud and inserts it into the reply. This is taylored for syncing.
 * @param stoneReply
 * @param cloudStoneId
 * @param cloudStone
 * @param cloud_behaviours
 * @param cloud_abilities
 * @param cloud_abilityProperties
 */
export async function fillSyncStoneData(stoneReply: SyncReplyStone, cloudStoneId: string, cloudStone: Stone, cloud_behaviours: nestedIdMap<StoneBehaviour>, cloud_abilities: nestedIdMap<StoneAbility>, cloud_abilityProperties: nestedIdMap<StoneAbilityProperty>) {
  stoneReply.data = await getReply(null, cloudStone,() => { return Dbs.stone.findById(cloudStoneId) });
  stoneReply.behaviours = {};
  stoneReply.abilities  = {};
  if (cloud_behaviours[cloudStoneId]) {
    let behaviourIds = Object.keys(cloud_behaviours[cloudStoneId]);
    for (let k = 0; k < behaviourIds.length; k++) {
      let behaviourId = behaviourIds[k];
      stoneReply.behaviours[behaviourId] = {data: await getReply(null, cloud_behaviours[cloudStoneId][behaviourId], () => { return Dbs.stoneBehaviour.findById(behaviourId); })}
    }
  }
  if (cloud_abilities[cloudStoneId]) {
    let abilityIds = Object.keys(cloud_abilities[cloudStoneId]);
    for (let k = 0; k < abilityIds.length; k++) {
      let abilityId = abilityIds[k];
      stoneReply.abilities[abilityId] = {data: await getReply(null, cloud_abilities[cloudStoneId][abilityId], () => { return Dbs.stoneAbility.findById(abilityId); })}

      stoneReply.abilities[abilityId].properties = {};
      if (cloud_abilityProperties[abilityId]) {
        let abilityPropertyIds = Object.keys(cloud_abilityProperties[abilityId]);
        for (let l = 0; l < abilityPropertyIds.length; l++) {
          let abilityPropertyId = abilityPropertyIds[l];
          stoneReply.abilities[abilityId].properties[abilityPropertyId] = {data: await getReply(null, cloud_abilityProperties[abilityId][abilityPropertyId], () => { return Dbs.stoneAbilityProperty.findById(abilityPropertyId); })}
        }
      }
    }
  }
}

/**
 *
 * @param stone
 */
export function markStoneChildrenAsNew(stone : SyncRequestStoneData) {
  if (stone.behaviours) {
    let behaviourIds = Object.keys(stone.behaviours);
    for (let k = 0; k < behaviourIds.length; k++) {
      stone.behaviours[behaviourIds[k]].new = true;
    }
  }
  if (stone.abilities) {
    let abilityIds = Object.keys(stone.abilities);
    for (let k = 0; k < abilityIds.length; k++) {
      let abilityId = abilityIds[k];
      stone.abilities[abilityId].new = true;
      if (stone.abilities[abilityId].properties) {
        let abilityPropertyIds = Object.keys(stone.abilities[abilityId].properties);
        for (let l = 0; l < abilityPropertyIds.length; l++) {
          stone.abilities[abilityId].properties[abilityPropertyIds[l]].new = true;
        }
      }
    }
  }
}
