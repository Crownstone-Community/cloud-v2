import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class SphereKey extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  keyType: string;

  @property({type: 'string', required: true})
  key: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

}