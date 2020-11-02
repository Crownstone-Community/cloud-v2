import {hasMany, hasOne, model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";
import {Position} from "./position.model";
import {Stone} from "./stone.model";
import {Fingerprint} from "./fingerprint.model";

@model()
export class Location extends SphereEntity {

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
}
