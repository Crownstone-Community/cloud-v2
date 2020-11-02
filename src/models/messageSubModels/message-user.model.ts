import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {SphereEntity} from "../bases/sphere-entity";
import {Message} from "../message.model";
import {User} from "../user.model";

@model()
export class MessageUser extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => Message, {name:"message"})
  messageId: number;

  @belongsTo(() => User, {name:"user"})
  userId: number;

}