import {model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class SphereTrackingNumber extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'number'})
  trackingNumber: number

  @property({type:'string'})
  trackingNumberId: string

  @property({type:'string'})
  trackingNumberType: string

}
