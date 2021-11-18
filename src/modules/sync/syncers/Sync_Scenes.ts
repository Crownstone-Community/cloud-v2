import {Dbs} from "../../containers/RepoContainer";
import {Scene} from "../../../models/scene.model";
import {Sync_Base} from "./Sync_Base";

export class Sync_Scenes extends Sync_Base<Scene, RequestItemCoreType> {

  fieldName : SyncCategory = "scenes";
  db = Dbs.scene;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  createEventCallback(clientScene: RequestItemCoreType, cloudScene: Scene) {
    // TODO: create scene event
  }

  updateEventCallback(sceneId: string, cloudScene: Scene) {
    // TODO: update scene event
  }
}