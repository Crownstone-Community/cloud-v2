import {belongsTo, model, property} from '@loopback/repository';
import {Location} from "./location.model";
import {Fingerprint} from "./fingerprint.model";
import {Device} from "./device.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class FingerprintLinker extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => Location)
  locationId: string;

  @belongsTo(() => Device)
  deviceId: number;

  @belongsTo(() => Fingerprint)
  fingerprintId: number;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: number;

}
