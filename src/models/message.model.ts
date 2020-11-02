import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";
import {User} from "./user.model";
import {Location} from "./location.model";
import {MessageState} from "./messageSubModels/message-state.model";
import {MessageUser} from "./messageSubModels/message-user.model";

@model()
export class Message extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  triggerEvent: string;

  @property({type: 'string'})
  content: string;

  @property({type: 'boolean'})
  everyoneInSphere: boolean;

  @property({type: 'boolean'})
  everyoneInSphereIncludingOwner: boolean;

  @property({type: 'boolean'})
  deliveredAll: boolean;

  @belongsTo(() => Location, {name:'triggerLocation'})
  triggerLocationId: number;

  @belongsTo(() => User, {name:'owner'})
  ownerId: number;

  @hasMany(() => User, {through: {model: () => MessageUser}})
  recipients: User[];

  @hasMany(() => MessageState, {keyTo: 'messageDeliveredId'})
  delivered: MessageState[];

  @hasMany(() => MessageState, {keyTo: 'messageReadId'})
  read: MessageState[];

}
