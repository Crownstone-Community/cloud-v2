import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {SphereTrackingNumber} from "../../../models/sphere-tracking-number.model";

export class Sync_TrackingNumbers extends Sync_Base<SphereTrackingNumber, RequestItemCoreType> {

  fieldName : SyncCategory = "trackingNumbers";
  db = Dbs.sphereTrackingNumber;
  writePermissions = {admin: true, member: true, guest: true}
  editPermissions  = {admin: true, member: true, guest: true}
}