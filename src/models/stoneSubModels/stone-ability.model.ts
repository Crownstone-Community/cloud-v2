import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {StoneAbilityProperty} from "./stone-ability-property.model";
import {StoneEntity} from "../bases/stone-entity";

@model()
export class StoneAbility extends StoneEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'boolean', required: true})
  enabled: string;

  @property({type: 'boolean', required: true})
  syncedToCrownstone: string;

  @hasMany(() => StoneAbilityProperty, {keyTo: 'abilityId'})
  abilities: StoneAbilityProperty[];
}