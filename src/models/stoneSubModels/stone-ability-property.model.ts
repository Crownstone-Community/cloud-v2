import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {SphereEntity} from "../bases/sphere-entity";
import {StoneAbility} from "./stone-ability.model";

@model()
export class StoneAbilityProperty extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'boolean', required: true})
  value: string;

  @belongsTo(() => StoneAbility)
  abilityId: number;

}