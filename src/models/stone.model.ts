import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {StoneAbility} from "./stoneSubModels/stone-ability.model";
import {StoneSwitchState} from "./stoneSubModels/stone-switch-state.model";
import {StoneBehaviour} from "./stoneSubModels/stone-behaviour.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Location} from "./location.model";
import {Sphere} from "./sphere.model";
import {StoneKey} from "./stoneSubModels/stone-key.model";

@model()
export class Stone extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string', required: true})
  address: string;

  @property({type: 'string'})
  type: string;

  @property({type: 'number'})
  major: number;

  @property({type: 'number'})
  minor: number;

  @property({type: 'number'})
  uid: number;

  @property({type: 'string'})
  description: string;

  @property({type: 'string'})
  icon: string;

  @property({type: 'string'})
  firmwareVersion: string;

  @property({type: 'string'})
  bootloaderVersion: string;

  @property({type: 'string'})
  hardwareVersion: string;

  @property({type: 'boolean'})
  locked: boolean;

  @belongsTo(() => Location)
  locationId: string;

  @hasOne(() => StoneSwitchState, {name: 'currentSwitchState', keyTo:'stoneId', keyFrom:'currentSwitchStateId'})
  currentSwitchState: StoneSwitchState;

  @hasMany(() => StoneAbility, {name: 'abilities', keyTo: 'stoneId'})
  abilities: StoneAbility[];

  @hasMany(() => StoneBehaviour, {name: 'behaviours', keyTo: 'stoneId'})
  behaviours: StoneBehaviour[];

  @hasMany(() => StoneSwitchState, {name: 'switchStateHistory', keyTo: 'stoneId'})
  switchStateHistory: StoneSwitchState[];

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
