import {model, property, belongsTo,} from '@loopback/repository';
import {Sphere} from "./sphere.model";
import { User } from './user.model';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";

@model()
export class SphereAccess extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'boolean', default: false})
  invitePending: boolean

  @property({type:'string'})
  sphereAuthorizationToken: string

  @property({type:'string'})
  role: string

  @belongsTo(() => Sphere)
  sphereId: string;

  @belongsTo(() => User)
  userId: string;
}


export const AccessLevels = {
  admin: 'admin',
  member: 'member',
  guest: 'guest',
  basic: 'basic',
  hub: 'hub',
}
