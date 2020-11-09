import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Sphere} from "./sphere.model";
import {Location} from "./location.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";

@model()
export class Position extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number'})
  x: number;

  @property({type: 'number'})
  y: number;

  @belongsTo(() => Sphere)
  sphereId: string;

  @belongsTo(() => Location)
  locationId: string;

}
