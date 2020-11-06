import {hasMany, model, property} from '@loopback/repository';
import {Sphere} from "./sphere.model";
import {Device} from "./device.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {SphereAccess} from "./sphere-access.model";

@model({settings:{hiddenProperties:["earlyAccessLevel","password",'verificationToken']}})
export class User extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'boolean', default: false})
  accountCreationPending: boolean;

  @property({type: 'string'})
  profilePicId: string;

  @property({type: 'string'})
  firstName: string;

  @property({type: 'string'})
  lastName: string;

  @property({type: 'string', required: true})
  email: string;

  @property({type: 'boolean', default: false})
  emailVerified: boolean;

  @property({type: 'string', required: true})
  password: string;

  @property({type: 'string'})
  verificationToken: string;

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

  @hasMany(() => Sphere, {through: {model: () => SphereAccess}})
  spheres: Sphere[];

  @hasMany(() => Device, {keyTo: 'ownerId'})
  devices: Device[];

}
