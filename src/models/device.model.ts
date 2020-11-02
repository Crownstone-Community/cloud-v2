import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {FingerprintLinker, Location, User} from "./index";
import {DevicePreferences} from "./device-preferences.model";
import {TimestampedEntity} from "./bases/timestamped-entity";
import {AppInstallation} from "./app-installation.model";
import {SphereTrackingNumber} from "./sphere-tracking-number.model";

@model()
export class Device extends TimestampedEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string', required: true})
  address: string;

  @property({type: 'string'})
  description: string;

  @property({type: 'string'})
  os: string;

  @property({type: 'string'})
  userAgent: string;

  @property({type: 'string'})
  locale: string;

  @property({type: 'string'})
  model: string;

  @property({type: 'number'})
  tapToToggleCalibration: number;

  @belongsTo(() => User, {name:'owner'})
  ownerId: number;

  @hasMany(() => AppInstallation, {keyTo: 'deviceId'})
  installations: AppInstallation[];

  @hasMany(() => FingerprintLinker, {keyTo: 'deviceId'})
  fingerprintLinks: FingerprintLinker[];

  @hasMany(() => DevicePreferences, {keyTo: 'deviceId'})
  preferences: DevicePreferences[];

  @hasMany(() => SphereTrackingNumber, {keyTo: 'foreignId'})
  trackingNumber: SphereTrackingNumber[]
}
