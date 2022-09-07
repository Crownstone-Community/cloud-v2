import {Entity, model, property} from '@loopback/repository';
import {Notifications_apns} from "./apns.model";
import {Notifications_Gcm} from "./gcm.model";

@model()
export class PushSettings extends Entity {
  @property( )
  apns: Notifications_apns;

  @property()
  gcm: Notifications_Gcm;
}
