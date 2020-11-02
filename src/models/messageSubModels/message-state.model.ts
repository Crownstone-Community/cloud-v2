import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {SphereEntity} from "../bases/sphere-entity";
import {Message} from "../message.model";
import {User} from "../user.model";

@model()
export class MessageState extends SphereEntity {
  @property({type: 'string', id: true})
  id: string;

  @property({type: 'date', required: true})
  timestamp: Date;

  @property({type: 'boolean', required: true})
  enabled: string;

  @property({type: 'boolean', required: true})
  syncedToCrownstone: string;

  @belongsTo(() => Message, {name:"messageDelivered"})
  messageDeliveredId: number;

  @belongsTo(() => Message, {name:"messageRead"})
  messageReadId: number;

  @belongsTo(() => User, {name:"user"})
  userId: number;

}