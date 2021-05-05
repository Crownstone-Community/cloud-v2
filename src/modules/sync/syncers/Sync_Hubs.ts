import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {Hub} from "../../../models/hub.model";

export class Sync_Hubs extends Sync_Base<Hub, RequestItemCoreType> {

  fieldName : SyncCategory = "hubs";
  db = Dbs.hub;
  writePermissions = {admin: true}
  editPermissions  = {admin: true}

  createEventCallback(clientHub: RequestItemCoreType, cloudHub: Hub) {
    // TODO: create hub event
  }

  updateEventCallback(hubId: string, cloudHub: Hub) {
    // TODO: create hub event
  }

}