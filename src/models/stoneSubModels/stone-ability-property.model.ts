import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {StoneAbility} from "./stone-ability.model";
import {StoneEntity} from "../bases/stone-entity";

@model()
export class StoneAbilityProperty extends StoneEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'boolean', required: true})
  value: string;

  @belongsTo(() => StoneAbility)
  abilityId: number;

}