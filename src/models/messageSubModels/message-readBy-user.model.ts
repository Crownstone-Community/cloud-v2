import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {Message} from "../message.model";
import {User} from "../user.model";
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";

@model()
export class MessageReadByUser extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => Message, {name:"message"})
  messageId: string;

  @belongsTo(() => User, {name:"user"})
  userId: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

}
