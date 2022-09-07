import {Entity, model, property} from '@loopback/repository';

@model()
export class Notifications_Gcm extends Entity {
  @property({type: 'string'})
  serverApiKey: string;
}
