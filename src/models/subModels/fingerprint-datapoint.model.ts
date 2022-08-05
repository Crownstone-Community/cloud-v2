import {Entity, model, property} from '@loopback/repository';


@model()
export class FingerprintDatapoint extends Entity {

  @property({type: 'number'})
  dt: number;

  @property({type: 'object'})
  data: FingerprintDataPointObject;
}
