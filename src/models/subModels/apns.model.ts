import {Entity, model, property} from '@loopback/repository';
import {Notifications_apnsKey} from "./apns-key.model";

@model()
export class Notifications_apns extends Entity {
  @property()
  keyToken: Notifications_apnsKey;

  @property()
  keyId: Notifications_apnsKey;

  @property()
  teamId: Notifications_apnsKey;
}
