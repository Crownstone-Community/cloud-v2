import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Device} from "./device.model";

@model()
export class AppInstallation extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  appName: string;

  @property({type: 'string'})
  appVersion: string;

  @property({type: 'string', required: true})
  deviceType: string;

  @property({type: 'string'})
  deviceToken: string;

  @property({type: 'boolean', required: true, default: false})
  developmentApp: boolean

  @belongsTo(() => Device)
  deviceId: number;

}
