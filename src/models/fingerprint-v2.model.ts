import {belongsTo, model, property} from '@loopback/repository';
import {Location} from "./location.model";
import {User} from "./user.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";
import {FingerprintDatapoint} from "./subModels/fingerprint-datapoint.model";

@model()
export class FingerprintV2 extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'string', required: true})
  createdOnDeviceType: string;

  @property({type: 'boolean', default: false})
  exclusive: boolean;

  @property({type: 'array', itemType: 'string', required: true})
  crownstonesAtCreation: string[]; // array of maj_min as id representing the Crownstone.

  @property({type: 'array', itemType: 'object', required: true})
  data: FingerprintDatapoint[];

  @belongsTo(() => Location)
  locationId: string;

  @belongsTo(() => User, {name:'creator'})
  createdByUser: string;

  @belongsTo(() => Sphere)
  sphereId: string;
}
