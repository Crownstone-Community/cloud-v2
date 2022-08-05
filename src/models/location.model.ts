import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {Stone} from "./stone.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";
import {FingerprintV2} from "./fingerprint-v2.model";

@model()
export class Location extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'number'})
  uid: number;

  @property({type: 'string'})
  description: string;

  @property({type: 'string'})
  icon: string;

  @property({type: 'string'})
  imageId: string;

  @property({type: 'string'})
  stockPicture: string;

  @hasMany(() => FingerprintV2, {keyTo: 'locationId'})
  fingerprints: FingerprintV2[];

  @hasMany(() => Stone, {keyTo: 'locationId'})
  stones: Stone[];

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
