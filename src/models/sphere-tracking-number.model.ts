import {Entity, model, property, belongsTo,} from '@loopback/repository';
import {Sphere} from "./sphere.model";

@model()
export class SphereTrackingNumber extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'number'})
  trackingNumber: number

  @property({type:'string'})
  trackingNumberId: string

  @property({type:'string'})
  trackingNumberType: string

  @belongsTo(() => Sphere)
  sphereId: number;

}
