import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {Toon} from "../../../models/toon.model";

export class Sync_Toons extends Sync_Base<Toon, RequestItemCoreType> {

  fieldName : DataCategory = "toons";
  db = Dbs.toon;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

}