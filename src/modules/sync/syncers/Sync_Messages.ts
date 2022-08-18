import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {MessageRecipientUser} from "../../../models/messageSubModels/message-recipient-user.model";
import {MessageDeletedByUser} from "../../../models/messageSubModels/message-deletedBy-user.model";
import {MessageReadByUser} from "../../../models/messageSubModels/message-readBy-user.model";
import {MessageV2} from "../../../models/messageV2.model";
import {Sync_message_readBy} from "./message-modules/Sync_message_readBy";
import {Sync_message_deletedBy} from "./message-modules/Sync_message_deletedBy";


export class Sync_Messages extends Sync_Base<MessageV2, RequestItemCoreType> {

  fieldName : SyncCategory = "messages";
  db = Dbs.messageV2;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  cloud_recipientUsers : nestedIdArray<MessageRecipientUser>
  cloud_readByUsers    : nestedIdMap<MessageDeletedByUser>
  cloud_deletedByUsers : nestedIdMap<MessageReadByUser>

  userId: string;

  constructor(userId: string, sphereId: string, accessRole: ACCESS_ROLE, requestSphere: any, replySphere: any, creationMap: creationMap) {
    super(sphereId, accessRole, requestSphere, replySphere, creationMap);

    this.userId = userId;
  }

  loadChildData(
    cloud_recipientUsers : nestedIdArray<MessageRecipientUser>,
    cloud_readByUsers    : nestedIdMap<MessageDeletedByUser>,
    cloud_deletedByUsers : nestedIdMap<MessageReadByUser>) {
    this.cloud_recipientUsers = cloud_recipientUsers;
    this.cloud_readByUsers    = cloud_readByUsers;
    this.cloud_deletedByUsers = cloud_deletedByUsers;
  }

  createEventCallback(clientMessage: RequestItemCoreType, cloudMessage: MessageV2) {
  }

  updateEventCallback(messageId: string, cloudMessage: MessageV2) {
  }


  /**
   * After syncing the message's data, this will allow us the sync the model's children.
   * @param replyAtPoint | the branch in the reply belonging to this message ( sphereReply.messages[messageId] )
   * @param clientItem
   * @param clientId
   * @param cloudId
   */
  async syncClientItemCallback(messageReply: any, clientItem: SyncRequestMessageData, messageId: string, cloudMessageId: string) {
    if (messageReply.data.status === "NOT_AVAILABLE") { return; }

    let readBySyncer = new Sync_message_readBy(
      this.userId, this.sphereId, cloudMessageId, this.accessRole, clientItem, messageReply, this.creationMap
    );
    await readBySyncer.processRequest(this.cloud_readByUsers[cloudMessageId])

    let deletedBySyncer = new Sync_message_deletedBy(
      this.userId, this.sphereId, cloudMessageId, this.accessRole, clientItem, messageReply, this.creationMap
    );
    await deletedBySyncer.processRequest(this.cloud_deletedByUsers[cloudMessageId])


    // inject recipients into the message
    if (messageReply.data.status === "CREATED_IN_CLOUD" || messageReply.data.status === "UPDATED_IN_CLOUD") {
      this.cloud_recipientUsers[cloudMessageId] = await Dbs.messageRecipientUser.find({where:{messageId: cloudMessageId}, fields: { userId: true, messageId: true }});
    }
    if (this.cloud_recipientUsers[cloudMessageId] && messageReply?.data?.data) {
      messageReply.data.data.recipients = this.cloud_recipientUsers[cloudMessageId];
    }


  }

  /**
   * This callback is used to handle nested fields. It is difficult to read but this avoids a lot of code duplication. Used for abilityProperties
   * @param item  | This is the instance of the newly created datamodel.
   */
  async syncClientItemReplyCallback(messageReply: any, clientItem: SyncRequestMessageData, messageCloudId: string) {
    let readBySyncer = new Sync_message_readBy(
      this.userId, this.sphereId, messageCloudId, this.accessRole, clientItem, messageReply, this.creationMap
    );
    await readBySyncer.processReply()

    let deletedBySyncer = new Sync_message_deletedBy(
      this.userId, this.sphereId, messageCloudId, this.accessRole, clientItem, messageReply, this.creationMap
    );
    await deletedBySyncer.processReply()
  }



  /**
   * When we generate a summary of the message for messages that the user does not know about,
   * this method will fill out the data for the child models of the message.
   *
   * @param messageReply    | the branch in the reply belonging to this message ( sphereReply.messages[messageId] )
   * @param cloudMessage    | the model of the message that's stored in the cloud
   * @param cloudMessageId
   */
  async syncCloudItemCallback(messageReply: any, cloudMessage: MessageV2, cloudMessageId: string) {
    if (messageReply.data.status === "CREATED_IN_CLOUD") {
      this.cloud_recipientUsers[cloudMessageId] = await Dbs.messageRecipientUser.find({where:{messageId: cloudMessageId}, fields:{sphereId: false, id: false}});
    }
    if (this.cloud_recipientUsers[cloudMessageId] && messageReply?.data?.data) {
      messageReply.data.data.recipients = this.cloud_recipientUsers[cloudMessageId];
    }

    messageReply.deletedBy = this.cloud_deletedByUsers[cloudMessageId] ?? {};
    messageReply.readBy    = this.cloud_readByUsers[cloudMessageId]    ?? {};


  }


  /**
   * If the message is new, mark the behaviours, abilities and abilityProperties as new as well.
   * @param clientMessage
   */
  markChildrenAsNew(clientMessage: SyncRequestMessageData) {

  }
}
