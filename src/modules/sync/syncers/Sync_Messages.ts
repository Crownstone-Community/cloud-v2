import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {MessageV2} from "../../../models/messageV2.model";

export class Sync_Messages extends Sync_Base<MessageV2, RequestItemCoreType> {

  fieldName : SyncCategory = "messages";
  db = Dbs.messageV2;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  createEventCallback(clientMessage: RequestItemCoreType, cloudMessage: MessageV2) {
  }

  updateEventCallback(messageId: string, cloudMessage: MessageV2) {
  }
}
