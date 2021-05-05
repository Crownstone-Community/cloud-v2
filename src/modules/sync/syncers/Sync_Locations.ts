import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {Location} from "../../../models/location.model";
import {EventHandler} from "../../sse/EventHandler";
import {EventLocationCache} from "../../sse/events/EventConstructor";

export class Sync_Locations extends Sync_Base<Location, RequestItemCoreType> {

  fieldName : SyncCategory = "locations";
  db = Dbs.location;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  createEventCallback(clientLocation: RequestItemCoreType, cloudLocation: Location) {
    EventHandler.dataChange.sendLocationCreatedEventBySphereId(this.sphereId, cloudLocation);
  }

  updateEventCallback(locationId: string, cloudLocation: Location) {
    EventLocationCache.merge(locationId, cloudLocation);
    EventHandler.dataChange.sendLocationUpdatedEventByIds(this.sphereId, locationId);
  }


}