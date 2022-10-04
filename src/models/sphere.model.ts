import {model, property, hasMany} from '@loopback/repository';
import {SphereFeature} from "./sphere-feature.model";
import {Toon} from "./toon.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {GeoPoint} from "./subModels/geo-point.model";
import {User} from "./user.model";
import {Location} from "./location.model";
import {Stone} from "./stone.model";
import {Scene} from "./scene.model";
import {Hub} from "./hub.model";
import {SphereAccess} from "./sphere-access.model";
import {SphereTrackingNumber} from "./sphere-tracking-number.model";
import {FingerprintV2} from "./fingerprint-v2.model";
import {MessageV2} from "./messageV2.model";

@model()
export class Sphere extends AddTimestamps(BaseEntity) {
  constructor(data?: Partial<EventListener>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  name: string;

  @property({type: 'number'})
  uid: number;

  @property({type: 'string'})
  uuid: string;

  @property({type: 'string'})
  aiName: string;

  @property()
  gpsLocation: GeoPoint;

  @property({type: 'string'})
  timezone: string;

  @hasMany(() => Location, {keyTo: 'sphereId'})
  locations: Location[];

  @hasMany(() => Stone, {keyTo: 'sphereId'})
  stones: Stone[];

  @hasMany(() => FingerprintV2, {keyTo: 'sphereId'})
  fingerprints: FingerprintV2[];

  @hasMany(() => Scene, {keyTo: 'sphereId'})
  scenes: Scene[];

  @hasMany(() => MessageV2, {keyTo: 'sphereId'})
  messages: MessageV2[];

  @hasMany(() => Hub, {keyTo: 'sphereId'})
  hubs: Hub[];

  @hasMany(() => SphereTrackingNumber, {keyTo: 'sphereId'})
  trackingNumbers: SphereTrackingNumber[];

  @hasMany(() => SphereFeature, {keyTo: 'sphereId'})
  features: SphereFeature[];

  @hasMany(() => User, {through: {model: () => SphereAccess}})
  users: User[];

  @hasMany(() => Toon, {keyTo: 'sphereId'})
  toons: Toon[];

}
