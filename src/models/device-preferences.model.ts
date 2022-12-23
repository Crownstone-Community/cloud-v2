import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Device} from "./device.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";

@model({settings:{mongodb: {collection: 'Preference'}}})
export class DevicePreferences extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  property: string;

  @property({type:'any'})
  value: any | boolean | string | number | any[];

  @belongsTo(() => Device)
  deviceId: string;

}
