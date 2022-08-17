import {Sync_Base} from "../Sync_Base";
import {Dbs} from "../../../containers/RepoContainer";
import {MessageReadByUser} from "../../../../models/messageSubModels/message-readBy-user.model";

export class Sync_message_readBy extends Sync_Base<MessageReadByUser, RequestItemCoreType> {

  fieldName : DataCategory = "readBy";
  db = Dbs.messageReadByUser;
  writePermissions = {admin: true, member: true, hub: true}
  editPermissions  = {admin: true, member: true, hub: true}

  messageId: string;
  userId: string;

  constructor(
    userId: string,
    sphereId: string,
    stoneId: string, // this is the cloudId
    accessRole: ACCESS_ROLE,
    request: any,
    reply: any,
    creationMap: creationMap,
  ) {
    super(sphereId, accessRole, request, reply, creationMap);
    this.userId = userId;
    this.messageId = stoneId;
  }

  setCreationAdditions() {
    this.creationAdditions = { userId: this.userId, messageId: this.messageId, sphereId: this.sphereId };
  }

}