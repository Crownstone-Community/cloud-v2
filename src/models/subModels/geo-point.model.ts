import {Entity, model, property} from '@loopback/repository';

@model()
export class GeoPoint extends Entity {

  @property({type: 'number'})
  lat: number;

  @property({type: 'number'})
  lng: number;
}
