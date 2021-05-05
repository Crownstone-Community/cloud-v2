import {StoneBehaviour} from "../../../../models/stoneSubModels/stone-behaviour.model";
import {Sync_Base} from "../Sync_Base";
import {Dbs} from "../../../containers/RepoContainer";

export class Sync_Stone_Behaviours extends Sync_Base<StoneBehaviour, RequestItemCoreType> {

  fieldName : SyncCategory = "behaviours";
  db = Dbs.stoneBehaviour;
  writePermissions = {admin: true, member: true, hub: true}
  editPermissions  = {admin: true, member: true, hub: true}

  stoneId: string;
  stoneIsNew : boolean;

  constructor(
    sphereId: string,
    stoneId: string, // this is the cloudId
    accessRole: ACCESS_ROLE,
    request: any,
    reply: any,
    creationMap: creationMap,
  ) {
    super(sphereId, accessRole, request, reply, creationMap);
    this.stoneId = stoneId;
    this.stoneIsNew = request.new ?? false;
  }

  setCreationAdditions() {
    this.creationAdditions = { stoneId: this.stoneId, sphereId: this.sphereId };
  }

  createEventCallback(clientBehaviour: RequestItemCoreType, cloudBehaviour: StoneBehaviour) {
    if (this.stoneIsNew || clientBehaviour.new) { return; }
    // TODO: create behaviour create event
  }
  updateEventCallback(behaviourId: string, cloudBehaviour: StoneBehaviour) {
    // TODO: create behaviour update event
  }
}