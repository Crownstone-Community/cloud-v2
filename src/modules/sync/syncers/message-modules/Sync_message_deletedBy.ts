import {Sync_Base} from "../Sync_Base";
import {Dbs} from "../../../containers/RepoContainer";
import {MessageDeletedByUser} from "../../../../models/messageSubModels/message-deletedBy-user.model";

export class Sync_message_deletedBy extends Sync_Base<MessageDeletedByUser, RequestItemCoreType> {

  fieldName : DataCategory = "deletedBy";
  db = Dbs.messageDeletedByUser;
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