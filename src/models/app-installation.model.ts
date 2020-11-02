import {belongsTo, model, property} from '@loopback/repository';
import {TimestampedEntity} from "./bases/timestamped-entity";
import {Device} from "./device.model";

@model()
export class AppInstallation extends TimestampedEntity {

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

  @belongsTo(() => Device, {name:'device'})
  deviceId: number;
}
