import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Device} from "./device.model";
import {TimestampedEntity} from "./bases/timestamped-entity";

@model()
export class DevicePreferences extends TimestampedEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  property: string;

  @property({type: 'boolean', required: true})
  value: string;

  @belongsTo(() => Device)
  deviceId: number;

}