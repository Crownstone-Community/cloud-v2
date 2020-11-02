import {Entity, model, property, hasMany, belongsTo,} from '@loopback/repository';
import {TimestampedEntity} from "./bases/timestamped-entity";
import {GeoPoint, Hub, Location, Message, Scene, SphereAccess, Stone, User} from "./index";
import {SortedList} from "./sorted-list.model";
import {SphereFeature} from "./sphere-feature.model";
import {Toon} from "./toon.model";

@model()
export class Sphere extends TimestampedEntity {
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

  @belongsTo(() => User, {name:'owner'})
  ownerId: number;

  @hasMany(() => Location, {keyTo: 'sphereId'})
  locations: Location[];

  @hasMany(() => Stone, {keyTo: 'sphereId'})
  stones: Stone[];

  @hasMany(() => Scene, {keyTo: 'sphereId'})
  scenes: Scene[];

  @hasMany(() => Message, {keyTo: 'sphereId'})
  messages: Message[];

  @hasMany(() => Hub, {keyTo: 'sphereId'})
  hubs: Hub[];

  @hasMany(() => SortedList, {keyTo: 'sphereId'})
  sortedLists: SortedList[];

  @hasMany(() => SphereFeature, {keyTo: 'sphereId'})
  features: SphereFeature[];

  @hasMany(() => User, {through: {model: () => SphereAccess}})
  users: User[];

  @hasMany(() => Toon, {keyTo: 'sphereId'})
  toons: Toon[];
}
