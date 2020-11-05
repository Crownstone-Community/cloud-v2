import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {Message} from "../message.model";
import {User} from "../user.model";
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";

@model()
export class MessageState extends AddTimestamps(BaseEntity) {
  @property({type: 'string', id: true})
  id: string;

  @property({type: 'date', required: true})
  timestamp: Date;

  @property({type: 'boolean', required: true})
  enabled: string;

  @property({type: 'boolean', required: true})
  syncedToCrownstone: string;

  @belongsTo(() => Message, {name:"messageDelivered"})
  messageDeliveredId: string;

  @belongsTo(() => Message, {name:"messageRead"})
  messageReadId: string;

  @belongsTo(() => User, {name:"user"})
  userId: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}