import {Entity, model, property} from '@loopback/repository';

@model()
export class Notifications_apnsKey extends Entity {
  @property({type: 'string'})
  type: string;

  @property({type: 'string'})
  description: string;
}
