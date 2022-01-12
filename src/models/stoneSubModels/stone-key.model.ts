import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";


// this setting will ensure that queries will not automatically convert a stringID to an ObjectId for the sphereId and stoneID field.
// These keys are explicitly not linked to the sphere by a inclusion relation to avoid mistakes in relation security
// to get access to a key from a sphere.
@model({settings: {strictObjectIDCoercion: true}})
export class StoneKey extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  keyType: string;

  @property({type: 'string', required: true})
  key: string;

  @property({type: 'number', required: true})
  ttl: number;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;
}