import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {User} from "./user.model";
import {Location} from "./location.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";
import {MessageReadByUser} from "./messageSubModels/message-readBy-user.model";
import {MessageDeletedByUser} from "./messageSubModels/message-deletedBy-user.model";
import {MessageRecipientUser} from "./messageSubModels/message-recipient-user.model";

@model()
export class MessageV2 extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', default:'enter'})
  triggerEvent: string;

  @property({type: 'string'})
  content: string;

  @property({type: 'boolean', default: false})
  everyoneInSphere: boolean;

  @property({type: 'boolean', default: false})
  everyoneInSphereIncludingOwner: boolean;

  @hasMany(() => MessageRecipientUser, {keyTo: 'messageId'})
  recipients: MessageRecipientUser[];

  @hasMany(() => MessageDeletedByUser, {keyTo: 'messageId'})
  deletedBy: MessageDeletedByUser[];

  @hasMany(() => MessageReadByUser, {keyTo: 'messageId'})
  readBy: MessageReadByUser[];

  @belongsTo(() => Location, {name:'triggerLocation'})
  triggerLocationId: string;

  @belongsTo(() => User, {name:'owner'})
  ownerId: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

}

