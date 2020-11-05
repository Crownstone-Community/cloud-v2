import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Device} from "./device.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";

@model()
export class DevicePreferences extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  property: string;

  @property({type: 'boolean', required: true})
  value: string;

  @belongsTo(() => Device)
  deviceId: string;

}