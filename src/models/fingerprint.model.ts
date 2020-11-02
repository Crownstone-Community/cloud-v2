import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";
import {Location} from "./location.model";
import {User} from "./user.model";

@model()
export class Fingerprint extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  phoneType: string;

  @property({type: 'number'})
  data: any;

  @property({type: 'boolean', default: false})
  isTransformed: boolean;

  @belongsTo(() => Location)
  locationId: string;

  @belongsTo(() => User, {name:'owner'})
  ownerId: number;
}
