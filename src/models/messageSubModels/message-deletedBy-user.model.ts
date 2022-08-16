import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {User} from "../user.model";
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";
import {MessageV2} from "../messageV2.model";

@model({settings: {hiddenProperties:['messageId'], strictObjectIDCoercion: true}})
export class MessageDeletedByUser extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => MessageV2, {name:"message"})
  messageId: string;

  @belongsTo(() => User, {name:"user"})
  userId: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

}
