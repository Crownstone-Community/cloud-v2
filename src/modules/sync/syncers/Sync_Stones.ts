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
import {EventStoneCache} from "../../sse/events/EventConstructor";

export class Sync_Stones extends Sync_Base<Stone, SyncRequestStoneData> {

  fieldName : SyncCategory = "stones";
  db = Dbs.stone;
  writePermissions = { admin: true }
  editPermissions  = { admin: true, member: true }

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

  createEventCallback(clientStone: SyncRequestStoneData, cloudStone: Stone) {
    EventHandler.dataChange.sendStoneCreatedEventBySphereId(this.sphereId, cloudStone);
  }


  updateEventCallback(stoneId: string, cloudStone: Stone) {
    EventStoneCache.merge(stoneId, cloudStone);
    EventHandler.dataChange.sendStoneUpdatedEventByIds(this.sphereId, stoneId);
  }

  async syncClientItemReplyCallback(stoneReply: any, clientItem: SyncRequestStoneData, stoneCloudId: string) {
    let behaviourSyncer = new Sync_Stone_Behaviours(
      this.sphereId, stoneCloudId, this.accessRole, clientItem, stoneReply, this.creationMap
    );
    await behaviourSyncer.processReply();

    let abilitySyncer = new Sync_Stone_Abilities(
      this.sphereId, stoneCloudId, this.accessRole, clientItem, stoneReply, this.creationMap, this.cloud_abilityProperties
    );
    await abilitySyncer.processReply();
  }


  /**
   * After syncing the stone's data, this will allow us the sync the model's children.
   * @param replyAtPoint | the branch in the reply belonging to this stone ( sphereReply.stones[stoneId] )
   * @param clientItem
   * @param clientId
   * @param cloudId
   */
  async syncClientItemCallback(stoneReply: any, clientItem: SyncRequestStoneData, stoneId: string, stoneCloudId: string) {
    if (stoneReply.data.status === "NOT_AVAILABLE") { return; }

    let behaviourSyncer = new Sync_Stone_Behaviours(
      this.sphereId, stoneCloudId, this.accessRole, clientItem, stoneReply, this.creationMap
    );
    await behaviourSyncer.processRequest(this.cloud_behaviours[stoneId])

    let abilitySyncer = new Sync_Stone_Abilities(
      this.sphereId, stoneCloudId, this.accessRole, clientItem, stoneReply, this.creationMap, this.cloud_abilityProperties
    );
    await abilitySyncer.processRequest(this.cloud_abilities[stoneId])
  }


  /**
   * When we generate a summary of the stone for stones that the user does not know about,
   * this method will fill out the data for the child models of the stone.
   *
   * @param stoneReply    | the branch in the reply belonging to this stone ( sphereReply.stones[stoneId] )
   * @param cloudStone    | the model of the stone that's stored in the cloud
   * @param cloudStoneId
   */
  async syncCloudItemCallback(stoneReply: any, cloudStone: Stone, cloudStoneId: string) {
    stoneReply.behaviours = {};
    stoneReply.abilities  = {};


    if (this.cloud_behaviours[cloudStoneId]) {
      for (let behaviourId of Object.keys(this.cloud_behaviours[cloudStoneId])) {
        stoneReply.behaviours[behaviourId] = {data: await getReply(null, this.cloud_behaviours[cloudStoneId][behaviourId], () => { return Dbs.stoneBehaviour.findById(behaviourId); })}
      }
    }


    if (this.cloud_abilities[cloudStoneId]) {
      for (let abilityId of Object.keys(this.cloud_abilities[cloudStoneId])) {
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


  /**
   * If the stone is new, mark the behaviours, abilities and abilityProperties as new as well.
   * @param clientStone
   */
  markChildrenAsNew(clientStone: SyncRequestStoneData) {
    if (clientStone.behaviours) {
      for (let behaviourId of Object.keys(clientStone.behaviours)) {
        clientStone.behaviours[behaviourId].new = true;
      }
    }

    if (clientStone.abilities) {
      for (let abilityId of Object.keys(clientStone.abilities)) {
        clientStone.abilities[abilityId].new = true;
        if (clientStone.abilities[abilityId].properties) {
          for (let abilityPropertyId of Object.keys(clientStone.abilities[abilityId].properties)) {
            clientStone.abilities[abilityId].properties[abilityPropertyId].new = true;
          }
        }
      }
    }
  }
}