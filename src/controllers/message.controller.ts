// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {del, get, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {SphereItem} from "./support/SphereItem";
import {authorize} from "@loopback/authorization";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";
import {MessageV2} from "../models/messageV2.model";
import {Dbs} from "../modules/containers/RepoContainer";
import {ModelDefinition, repository} from "@loopback/repository";
import {SphereRepository} from "../repositories/data/sphere.repository";
import {
  MessageWithRecipients,
} from "../models/endpointModels/message-with-recipients.model";


export class MessageEndpoints extends SphereItem {
  authorizationModelName = "Sphere";

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @repository(SphereRepository) protected sphereRepo: SphereRepository,
  ) { super(); }


  @post('/spheres/{id}/message')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async sendMessage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @requestBody({required: true}) messageData: MessageWithRecipients,
  ): Promise<MessageV2> {
    messageData.message.ownerId = userProfile[securityId];

    let message = await this.sphereRepo.messages(sphereId).create(messageData.message);

    if (messageData.recipients) {
      for (let userId of messageData.recipients) {
        await Dbs.messageV2.addRecipient(sphereId, message.id, userId);
      }
    }

    return message;
  }


  @post('/messages/{id}/markAsRead')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember('Message'))
  async markAsRead(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') messageId: string,
  ): Promise<void> {
    let message = await Dbs.messageV2.findById(messageId, {fields:{sphereId: true}});
    await Dbs.messageV2.markAsRead(message.sphereId, messageId, userProfile[securityId]);
  }



  @post('/messages/{id}/markAsDeleted')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember('Message'))
  async markAsDeleted(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') messageId: string,
  ): Promise<void> {
    let message = await Dbs.messageV2.findById(messageId, {fields:{sphereId: true}});
    await Dbs.messageV2.markAsDeleted(message.sphereId, messageId, userProfile[securityId]);
  }



  @get('/spheres/{id}/messages')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAccess())
  async getMessages(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
  ): Promise<MessageV2[]> {

    // messages that you're one of the recipients of
    let allMessagesInSphere = (await this.sphereRepo.messages(sphereId).find({
      include:[
        {relation:'recipients', scope:{fields: {userId: true, messageId: true}}},
        {relation:'deletedBy',  scope:{fields: {userId: true, messageId: true, updatedAt: true}, where:{userId: userProfile[securityId]}}},
        {relation:'readBy',     scope:{fields: {userId: true, messageId: true, updatedAt: true}, where:{userId: userProfile[securityId]}}},
      ]
    }));

    // filter for messages that you have access to. This cannot be done in the query since neq with mongoIds is not working.
    let myMessages = filterForMyMessages(allMessagesInSphere, userProfile[securityId]);

    return myMessages
  }


  @del('/messages/{id}')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember('Message'))
  async deleteMessage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') messageId: string,
  ): Promise<void> {
    let message = await Dbs.messageV2.findById(messageId);
    if (message.ownerId == userProfile[securityId]) {
      await Dbs.messageV2.deleteById(messageId);
    }
    else {
      throw new HttpErrors.Unauthorized("You are not the owner of this message");
    }

  }


  @del('/sphere/{id}/allMessages')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAdmin())
  async deleteSphereMessages(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @param.query.string('AreYouSure', {required:true}) areYouSure: string,
  ) : Promise<void> {
    if (areYouSure !== "I_AM_SURE") {
      throw new HttpErrors.BadRequest("AreYouSure argument must be I_AM_SURE")
    }

    await Dbs.messageV2.deleteAll({sphereId: sphereId});
    await Dbs.messageRecipientUser.deleteAll({sphereId: sphereId});
    await Dbs.messageReadByUser.deleteAll({sphereId: sphereId});
    await Dbs.messageDeletedByUser.deleteAll({sphereId: sphereId});
  }
}

export function filterForMyMessages(messages: MessageV2[], userId: userId): MessageV2[] {
  if (!messages) { return; }

  return messages.filter(message => {
    if (message.everyoneInSphere === false && message.everyoneInSphereIncludingOwner === false) {
      if (!message.recipients || message.recipients.length == 0) { return false; }

      let messagesForMe = message.recipients.some(recipient => {
        return recipient.userId === userId
      });
      return messagesForMe;
    }
    else {
      return true;
    }
  });
}
