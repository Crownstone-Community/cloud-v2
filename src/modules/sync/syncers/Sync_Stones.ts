import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {EventHandler} from "../../sse/EventHandler";
import {Stone} from "../../../models/stone.model";
import {StoneBehaviour} from "../../../models/stoneSubModels/stone-behaviour.model";
import {StoneAbility} from "../../../models/stoneSubModels/stone-ability.model";
import {StoneAbilityProperty} from "../../../models/stoneSubModels/stone-ability-property.model";
import {Sync_Stone_Behaviours} from "./stone-modules/Sync_Stone_Behaviours";
import {getReply} from "../helpers/ReplyHelpers";
import {Sync_Stone_Abilities} from "./stone-modules/Sync_Stone_Abilities";

export class Sync_Stones extends Sync_Base<Stone, SyncRequestStoneData> {

  fieldName : SyncCategory = "stones";
  db = Dbs.stone;
  writePermissions = {admin: true}
  editPermissions  = {admin: true, member: true}

  cloud_behaviours : nestedIdMap<StoneBehaviour>
  cloud_abilities  : nestedIdMap<StoneAbility>
  cloud_abilityProperties : nestedIdMap<StoneAbilityProperty>

  loadChildData(
    cloud_behaviours : nestedIdMap<StoneBehaviour>,
    cloud_abilities  : nestedIdMap<StoneAbility>,
    cloud_abilityProperties : nestedIdMap<StoneAbilityProperty>) {
    this.cloud_behaviours        = cloud_behaviours;
    this.cloud_abilities         = cloud_abilities;
    this.cloud_abilityProperties = cloud_abilityProperties;
  }

  eventCallback(clientStone: SyncRequestStoneData, cloudStone: Stone) {
    EventHandler.dataChange.sendStoneCreatedEventBySphereId(this.sphereId, cloudStone);
  }

  async syncClientItemCallback(replyAtPoint: any, clientItem: SyncRequestStoneData, clientId: string, cloudId: string) {
    let behaviourSyncer = new Sync_Stone_Behaviours(
      this.sphereId,
      cloudId,
      this.accessRole,
      clientItem,
      replyAtPoint[clientId],
      this.creationMap
    );
    await behaviourSyncer.sync(this.cloud_behaviours[clientId])

    let abilitySyncer = new Sync_Stone_Abilities(
      this.sphereId,
      cloudId,
      this.accessRole,
      clientItem,
      replyAtPoint[clientId],
      this.creationMap,
      this.cloud_abilityProperties
    );
    await abilitySyncer.sync(this.cloud_abilities[clientId])
  }


  async syncCloudItemCallback(stoneReply: any, cloudStone: any, cloudStoneId: string) {
    stoneReply.behaviours = {};
    stoneReply.abilities  = {};
    if (this.cloud_behaviours[cloudStoneId]) {
      let behaviourIds = Object.keys(this.cloud_behaviours[cloudStoneId]);
      for (let k = 0; k < behaviourIds.length; k++) {
        let behaviourId = behaviourIds[k];
        stoneReply.behaviours[behaviourId] = {data: await getReply(null, this.cloud_behaviours[cloudStoneId][behaviourId], () => { return Dbs.stoneBehaviour.findById(behaviourId); })}
      }
    }
    if (this.cloud_abilities[cloudStoneId]) {
      let abilityIds = Object.keys(this.cloud_abilities[cloudStoneId]);
      for (let k = 0; k < abilityIds.length; k++) {
        let abilityId = abilityIds[k];
        stoneReply.abilities[abilityId] = {data: await getReply(null, this.cloud_abilities[cloudStoneId][abilityId], () => { return Dbs.stoneAbility.findById(abilityId); })}

        stoneReply.abilities[abilityId].properties = {};
        if (this.cloud_abilityProperties[abilityId]) {
          let abilityPropertyIds = Object.keys(this.cloud_abilityProperties[abilityId]);
          for (let l = 0; l < abilityPropertyIds.length; l++) {
            let abilityPropertyId = abilityPropertyIds[l];
            stoneReply.abilities[abilityId].properties[abilityPropertyId] = {data: await getReply(null, this.cloud_abilityProperties[abilityId][abilityPropertyId], () => { return Dbs.stoneAbilityProperty.findById(abilityPropertyId); })}
          }
        }
      }
    }
  }

  markChildrenAsNew(clientStone: SyncRequestStoneData) {
    if (clientStone.behaviours) {
      let behaviourIds = Object.keys(clientStone.behaviours);
      for (let k = 0; k < behaviourIds.length; k++) {
        clientStone.behaviours[behaviourIds[k]].new = true;
      }
    }
    if (clientStone.abilities) {
      let abilityIds = Object.keys(clientStone.abilities);
      for (let k = 0; k < abilityIds.length; k++) {
        let abilityId = abilityIds[k];
        clientStone.abilities[abilityId].new = true;
        if (clientStone.abilities[abilityId].properties) {
          let abilityPropertyIds = Object.keys(clientStone.abilities[abilityId].properties);
          for (let l = 0; l < abilityPropertyIds.length; l++) {
            clientStone.abilities[abilityId].properties[abilityPropertyIds[l]].new = true;
          }
        }
      }
    }
  }
}