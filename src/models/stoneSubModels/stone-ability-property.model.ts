import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {StoneAbility} from "./stone-ability.model";
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";

@model()
export class StoneAbilityProperty extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'string', required: true})
  value: string;

  @belongsTo(() => StoneAbility)
  abilityId: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;

}