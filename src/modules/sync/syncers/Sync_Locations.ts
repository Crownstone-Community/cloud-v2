import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {Location} from "../../../models/location.model";
import {EventHandler} from "../../sse/EventHandler";

export class Sync_Locations extends Sync_Base<Location, RequestItemCoreType> {

  fieldName : SyncCategory = "locations";
  db = Dbs.location;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  eventCallback(clientLocation: RequestItemCoreType, cloudLocation: Location) {
    EventHandler.dataChange.sendLocationCreatedEventBySphereId(this.sphereId, cloudLocation);
  }
}