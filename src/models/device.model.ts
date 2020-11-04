import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {DevicePreferences} from "./device-preferences.model";
import {AppInstallation} from "./app-installation.model";
import {SphereTrackingNumber} from "./sphere-tracking-number.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {FingerprintLinker} from "./fingerprint-linker.model";
import {User} from "./user.model";

@model()
export class Device extends AddTimestamps(BaseEntity) {

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
