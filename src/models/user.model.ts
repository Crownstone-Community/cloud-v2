import {hasMany, model, property} from '@loopback/repository';
import {TimestampedEntity} from "./bases/timestamped-entity";
import {Sphere} from "./sphere.model";
import {Device} from "./device.model";

@model({hiddenProperties:["earlyAccessLevel"]})
export class User extends TimestampedEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  profilePicId: string;

  @property({type: 'string'})
  firstName: string;

  @property({type: 'string'})
  lastName: string;

  @property({type: 'string', default: 'en_us'})
  language: string;

  @property({type: 'boolean', default: true})
  new: boolean;

  @property({type: 'boolean', default: true})
  uploadDeviceDetails: boolean;

  @property({type: 'boolean', default: true})
  uploadSwitchState: boolean;

  @property({type: 'boolean', default: true})
  uploadLocation: boolean;

  @property({type: 'number', default: 0, required: true})
  earlyAccessLevel: number;

  @hasMany(() => Sphere, {keyTo: 'ownerId'})
  spheres: Sphere[];

  @hasMany(() => Device, {keyTo: 'ownerId'})
  devices: Device[];

}
