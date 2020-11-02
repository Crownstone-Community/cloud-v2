import {Entity, model, property, belongsTo,} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class SphereFeature extends SphereEntity {

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

}
