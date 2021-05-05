import {Sync_Base} from "../Sync_Base";
import {Dbs} from "../../../containers/RepoContainer";
import {EventHandler} from "../../../sse/EventHandler";
import {StoneAbilityProperty} from "../../../../models/stoneSubModels/stone-ability-property.model";
import {StoneAbility} from "../../../../models/stoneSubModels/stone-ability.model";

export class Sync_Stone_AbilityProperties extends Sync_Base<StoneAbilityProperty, RequestItemCoreType> {

  fieldName : SyncCategory = "properties";
  db = Dbs.stoneAbilityProperty;
  writePermissions = {admin: true, member: true, hub: true}
  editPermissions  = {admin: true, member: true, hub: true}

  stoneId: string;
  abilityId: string;
  abilityIsNew : boolean;

  constructor(
    sphereId: string,
    stoneId: string, // this is the cloudId
    abilityId: string, // this is the cloudId
    accessRole: ACCESS_ROLE,
    request: any,
    reply: any,
    creationMap: creationMap,
  ) {
    super(sphereId, accessRole, request, reply, creationMap);
    this.stoneId = stoneId;
    this.abilityId = abilityId;
    this.abilityIsNew = request.new ?? false;
  }

  setCreationAdditions() {
    this.creationAdditions = { stoneId: this.stoneId, sphereId: this.sphereId, abilityId: this.abilityId };
  }

  createEventCallback(clientAbility: RequestItemCoreType, abilityProperty: StoneAbilityProperty) {
    if (this.abilityIsNew || clientAbility.new) { return; }
    EventHandler.dataChange.sendAbilityChangeEventByIds(this.sphereId, this.stoneId, this.abilityId);
  }

  updateEventCallback(abilityPropertyId: string, cloudAbilityProperty: StoneAbilityProperty) {
    EventHandler.dataChange.sendAbilityChangeEventByIds(this.sphereId, this.stoneId, this.abilityId);
  }

}