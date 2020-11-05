import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {Position} from "./position.model";
import {Stone} from "./stone.model";
import {Fingerprint} from "./fingerprint.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

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

  @hasMany(() => Fingerprint, {keyTo: 'locationId'})
  fingerprints: Fingerprint[];

  @hasMany(() => Stone, {keyTo: 'locationId'})
  stones: Stone[];

  @hasOne(() => Position,  {keyTo: 'locationId'})
  sphereOverviewPosition: Position

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
