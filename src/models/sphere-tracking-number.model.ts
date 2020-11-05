import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class SphereTrackingNumber extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'number'})
  trackingNumber: number

  @property({type:'string'})
  trackingNumberId: string

  @property({type:'string'})
  trackingNumberType: string

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

}
