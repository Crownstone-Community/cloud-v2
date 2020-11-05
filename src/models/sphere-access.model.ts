import {Entity, model, property, belongsTo,} from '@loopback/repository';
import {Sphere} from "./sphere.model";
import { User } from './user.model';

@model()
export class SphereAccess extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'boolean', default: true})
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
