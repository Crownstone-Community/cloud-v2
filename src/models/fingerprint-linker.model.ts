import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";
import {Location} from "./location.model";
import {Fingerprint} from "./fingerprint.model";
import {Device} from "./device.model";

@model()
export class FingerprintLinker extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => Location)
  locationId: string;

  @belongsTo(() => Device)
  deviceId: number;

  @belongsTo(() => Fingerprint)
  fingerprintId: number;
}
