import {Dbs} from "../../containers/RepoContainer";
import {User} from "../../../models/user.model";
import {Sync_Base_Custom} from "./Sync_Base_Custom";

export class Sync_Users extends Sync_Base_Custom<User, RequestItemCoreType> {

  fieldName : SyncCategory = "sphereUsers";
  db = Dbs.sphereAccess;
  writePermissions = {}
  editPermissions  = {}

  async processRequest(cloud_data : any = {}, creationAdditions? : idMap<string>) {
    let proposesSphereUsers = this.requestSphere[this.fieldName];

  }

  async processReply() {

  }



}