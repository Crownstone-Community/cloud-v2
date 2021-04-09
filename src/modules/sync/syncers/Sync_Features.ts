import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {SphereFeature} from "../../../models/sphere-feature.model";

export class Sync_Features extends Sync_Base<SphereFeature, RequestItemCoreType> {

  fieldName : SyncCategory = "features";
  db = Dbs.sphereFeature;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

}