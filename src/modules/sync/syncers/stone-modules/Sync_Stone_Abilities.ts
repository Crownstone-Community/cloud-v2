import {StoneAbility} from "../../../../models/stoneSubModels/stone-ability.model";
import {Sync_Base} from "../Sync_Base";
import {Dbs} from "../../../containers/RepoContainer";
import {StoneAbilityProperty} from "../../../../models/stoneSubModels/stone-ability-property.model";
import {EventHandler} from "../../../sse/EventHandler";
import {processSyncCollection} from "../../helpers/SyncHelpers";
import {getReply} from "../../helpers/ReplyHelpers";

export class Sync_Stone_Abilities extends Sync_Base<StoneAbility, RequestItemCoreType> {

  fieldName : SyncCategory = "abilities";
  db = Dbs.stoneAbility;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  cloud_abilityProperties : nestedIdMap<StoneAbilityProperty>
  stoneId    : string;
  stoneIsNew : boolean;

  constructor(
    sphereId: string,
    stoneId: string, // this is the cloudId
    accessRole: ACCESS_ROLE,
    request: any,
    reply: any,
    creationMap: creationMap,
    cloud_abilityProperties : nestedIdMap<StoneAbilityProperty>,
  ) {
    super(sphereId, accessRole, request, reply, creationMap);
    this.stoneId = stoneId;
    this.stoneIsNew = request.new ?? false;
    this.cloud_abilityProperties = cloud_abilityProperties;
  }

  setCreationAdditions() {
    this.creationAdditions = { stoneId: this.stoneId, sphereId: this.sphereId };
  }

  eventCallback(clientAbility: RequestItemCoreType, newAbility: StoneAbility) {
    if (this.stoneIsNew || clientAbility.new) { return; }
    EventHandler.dataChange.sendAbilityChangeEventByParentIds(this.sphereId, this.stoneId, newAbility);
  }

  async syncClientItemCallback(abilityReply : any, clientAbility: any, abilityId: string, abilityCloudId: string) {
    if (abilityReply[abilityId].data.status === "NOT_AVAILABLE") {
      return;
    }

    await processSyncCollection(
      'properties',
      Dbs.stoneAbilityProperty,
      {stoneId: this.stoneId, sphereId: this.sphereId, abilityId: abilityCloudId},
      clientAbility,
      abilityReply[abilityId], this.creationMap,
      this.accessRole,
      {admin: true, member: true, hub: true},
      {admin: true, member: true, hub: true},
      this.cloud_abilityProperties[abilityId],
      (clientAbility: RequestItemCoreType, abilityProperty: StoneAbilityProperty) => {
        if (this.stoneIsNew || clientAbility.new) { return; }

        // TODO: create ability property create event
        EventHandler.dataChange.sendAbilityChangeEventByIds(this.sphereId, this.stoneId, abilityId);
      },
    )
  }

  async syncCloudItemCallback(abilityReply: any, cloudAbilityProperties: StoneAbility, abilityId : string) : Promise<void> {
    let properties = this.cloud_abilityProperties[abilityId];

    if (properties) {
      abilityReply.properties = {};
      let abilityPropertyIds = Object.keys(properties || {});
      for (let l = 0; l < abilityPropertyIds.length; l++) {
        let abilityPropertyId = abilityPropertyIds[l];
        abilityReply.properties[abilityPropertyId] = {
          data:
            await getReply(
              null,
              properties[abilityPropertyId],
              () => { return Dbs.stoneAbilityProperty.findById(abilityPropertyId); }
            )
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