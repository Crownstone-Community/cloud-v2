import {Entity, model, property} from '@loopback/repository';

@model()
export class Notifications_apns extends Entity {
  @property()
  keyToken: string;

  @property()
  keyId: string;

  @property()
  teamId: string;
}
