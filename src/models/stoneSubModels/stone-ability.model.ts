import {belongsTo, hasMany, model, property} from '@loopback/repository';
import {StoneAbilityProperty} from "./stone-ability-property.model";
import {AddTimestamps} from "../bases/timestamp-mixin";
import {BaseEntity} from "../bases/base-entity";
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";

@model()
export class StoneAbility extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'boolean', required: true})
  enabled: string;

  @property({type: 'boolean', required: true})
  syncedToCrownstone: string;

  @hasMany(() => StoneAbilityProperty, {name: 'properties', keyTo: 'abilityId'})
  properties: StoneAbilityProperty[];

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;

}