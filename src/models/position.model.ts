import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Sphere} from "./sphere.model";
import {Location} from "./location.model";

@model()
export class Position extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number'})
  x: number;

  @property({type: 'number'})
  y: number;

  @belongsTo(() => Sphere)
  sphereId: number;

  @belongsTo(() => Location)
  locationId: number;

}
