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


const MessageWithRecipients = new ModelDefinition('MessageWithRecipients')
  .addProperty('message',   MessageV2)
  .addProperty('recipients', {type: 'array', itemType: 'string'});


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
    @requestBody({required: true}) messageData: typeof MessageWithRecipients,
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
  @authorize(Authorization.sphereMember())
  async getMessages(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
  ): Promise<MessageV2[]> {
    // messages that you're one of the recipients of
    let messagesForMe = (await this.sphereRepo.messages(sphereId).find({where: {
        everyoneInSphere: false, everyoneInSphereIncludingOwner: false,
      },
      include:[
        {relation: 'recipients', scope: {fields: {id:true}}},
        {relation: 'deletedBy',  scope: {where: {id: userProfile[securityId]}, fields: {id:true}}},
        {relation: 'readBy',     scope: {where: {id: userProfile[securityId]}, fields: {id:true}}},
      ]
    })).filter((message) => {
      return message.recipients.some((recipient) => {
        return recipient.id === userProfile[securityId];
      });
    });

    // you're the owner of the message, want to send it to everyone, including yourself
    let messagesForEveryoneAndOwner = await this.sphereRepo.messages(sphereId).find({
      where: {everyoneInSphereIncludingOwner: true, ownerId: userProfile[securityId]},
      include:[
        {relation: 'recipients', scope: {fields: {id:true}}},
        {relation: 'deletedBy',  scope: {where: {id: userProfile[securityId]}}},
        {relation: 'readBy',     scope: {where: {id: userProfile[securityId]}}},
      ]
    });

    // you're not the owner of the message, and it is sent to everyone.
    let messagesForEveryExceptOwner = await this.sphereRepo.messages(sphereId).find({
      where: {everyoneInSphere: true, ownerId: {neq: userProfile[securityId]}},
      include:[
        {relation: 'recipients', scope: {fields: {id:true}}},
        {relation: 'deletedBy',  scope: {where: {id: userProfile[securityId]}}},
        {relation: 'readBy',     scope: {where: {id: userProfile[securityId]}}},
      ]
    });

    return messagesForMe.concat(messagesForEveryoneAndOwner, messagesForEveryExceptOwner);
  }


  @del('/messages/{id}')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember('Message'))
  async deleteMessage(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') messageId: string,
  ): Promise<void> {
    let message = await Dbs.messageV2.findById(messageId);
    if (message.ownerId === userProfile[securityId]) {
      await Dbs.messageV2.deleteById(messageId);
    }
    else {
      throw new HttpErrors.Unauthorized("You are not the owner of this message");
    }

  }



}
