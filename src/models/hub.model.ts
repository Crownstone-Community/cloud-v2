import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";
import {Stone} from "./stone.model";
import {Location} from "./location.model";

@model({settings: { hiddenProperties: ["token"] }})
export class Hub extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string', required: true})
  token: string;

  @property({type: 'string'})
  localIPAddress: string;

  @property({type: 'number'})
  httpPort: number;

  @property({type: 'number'})
  httpsPort: number;

  @property({type: 'string'})
  externalIPAddress: string;

  @property({type: 'string'})
  state: string;

  @property({type: 'date'})
  lastSeen: Date

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone, {name:'linkedStone'})
  linkedStoneId: string;

  @belongsTo(() => Location, {name:'location'})
  locationId: string;

}
