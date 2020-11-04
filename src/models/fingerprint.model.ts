import {belongsTo, model, property} from '@loopback/repository';
import {Location} from "./location.model";
import {User} from "./user.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class Fingerprint extends AddTimestamps(BaseEntity) {

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


  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: number;
}
