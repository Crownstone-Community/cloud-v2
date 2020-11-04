import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class Hub extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string', required: true})
  token: string;

  @property({type: 'string'})
  localIPAddress: string;

  @property({type: 'string'})
  externalIPAddress: string;

  @property({type: 'string'})
  state: string;

  @property({type: 'date'})
  lastSeen: Date

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: number;

}
