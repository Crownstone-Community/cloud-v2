import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {User} from "./user.model";
import {Location} from "./location.model";
import {MessageState} from "./messageSubModels/message-state.model";
import {MessageUser} from "./messageSubModels/message-user.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class Message extends AddTimestamps(BaseEntity) {

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
  triggerLocationId: string;

  @belongsTo(() => User, {name:'owner'})
  ownerId: string;

  @hasMany(() => User, {through: {model: () => MessageUser}})
  recipients: User[];

  @hasMany(() => MessageState, {keyTo: 'messageDeliveredId'})
  delivered: MessageState[];

  @hasMany(() => MessageState, {keyTo: 'messageReadId'})
  read: MessageState[];

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

}
