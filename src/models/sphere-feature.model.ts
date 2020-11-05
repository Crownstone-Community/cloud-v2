import {Entity, model, property, belongsTo,} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class SphereFeature extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'date', required: true})
  from: Date

  @property({type:'date', required: true})
  until: Date

  @property({type:'string', required: true})
  name: string

  @property({type:'string'})
  data: string

  @property({type:'boolean', required: true})
  enabled: string


  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
