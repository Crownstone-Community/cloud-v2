import {belongsTo, model, property} from '@loopback/repository';
import {ActiveDays} from "../subModels/active-days.model";
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";

@model()
export class StoneBehaviour extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'boolean', required: true})
  data: string;

  @property({type: 'boolean', required: true})
  syncedToCrownstone: string;

  @property({type: 'number'})
  idOnCrownstone: number;

  @property({type: 'number'})
  profileIndex: number;

  @property({type: 'boolean'})
  deleted: boolean;

  @property()
  activeDays: ActiveDays

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;

}