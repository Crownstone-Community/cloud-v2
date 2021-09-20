import {StoneAbility} from "../../../../models/stoneSubModels/stone-ability.model";
import {Sync_Base} from "../Sync_Base";
import {Dbs} from "../../../containers/RepoContainer";
import {StoneAbilityProperty} from "../../../../models/stoneSubModels/stone-ability-property.model";
import {EventHandler} from "../../../sse/EventHandler";
import {getReply} from "../../helpers/ReplyHelpers";
import {Sync_Stone_AbilityProperties} from "./Sync_Stone_AbilityProperties";

export class Sync_Stone_Abilities extends Sync_Base<StoneAbility, SyncRequestAbilityData> {

  fieldName : DataCategory = "abilities";
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

  createEventCallback(clientAbility: RequestItemCoreType, newAbility: StoneAbility) {
    if (this.stoneIsNew || clientAbility.new) { return; }
    EventHandler.dataChange.sendAbilityChangeEventByParentIds(this.sphereId, this.stoneId, newAbility);
  }

  updateEventCallback(abilityId: string, cloudAbility: StoneAbility) {
    EventHandler.dataChange.sendAbilityChangeEventByIds(this.sphereId, this.stoneId, abilityId);
  }

  async syncClientItemReplyCallback(abilityReply: any, clientAbility: SyncRequestAbilityData, abilityCloudId: string) {
    let propertySyncer = new Sync_Stone_AbilityProperties(
      this.sphereId, this.stoneId, abilityCloudId, this.accessRole, clientAbility, abilityReply, this.creationMap
    );
    await propertySyncer.processReply()
  }

  /**
   *
   * @param abilityReply   | the branch in the reply belonging to this ability ( sphereReply.stones[stoneId].abilities[abilityId] )
   * @param clientAbility
   * @param abilityId
   * @param abilityCloudId
   */
  async syncClientItemCallback(abilityReply : any, clientAbility: SyncRequestAbilityData, abilityId: string, abilityCloudId: string) {
    if (abilityReply.data.status === "NOT_AVAILABLE") { return; }

    let propertySyncer = new Sync_Stone_AbilityProperties(
      this.sphereId, this.stoneId, abilityCloudId, this.accessRole, clientAbility, abilityReply, this.creationMap
    );
    await propertySyncer.processRequest(this.cloud_abilityProperties[abilityId]);
  }


  /**
   * When we generate a summary of the ability for abilities that the user does not know about,
   * this method will fill out the data for the child models of the ability.
   * @param abilityReply  | the branch in the reply belonging to this ability ( sphereReply.stones[stoneId].abilities[abilityId] )
   * @param cloudAbility
   * @param abilityId
   */
  async syncCloudItemCallback(abilityReply: any, cloudAbility: StoneAbility, cloudAbilityId : string) : Promise<void> {
    let properties = this.cloud_abilityProperties[cloudAbilityId];
    abilityReply.properties = {};

    if (properties) {
      for (let abilityPropertyId of Object.keys(properties || {})) {
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

  markChildrenAsNew(clientAbility: SyncRequestAbilityData) {
    if (clientAbility.properties) {
      for (let propertyId of Object.keys(clientAbility.properties)) {
        clientAbility.properties[propertyId].new = true;
      }
    }
  }
}