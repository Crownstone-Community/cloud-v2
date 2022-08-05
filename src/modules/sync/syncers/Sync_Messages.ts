import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {Message} from "../../../models/message.model";

export class Sync_Messages extends Sync_Base<Message, RequestItemCoreType> {

  fieldName : SyncCategory = "messages";
  db = Dbs.message;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  createEventCallback(clientMessage: RequestItemCoreType, cloudMessage: Message) {
  }

  updateEventCallback(messageId: string, cloudMessage: Message) {
  }

}