import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";
import {Sphere} from "./sphere.model";
import {Location} from "./index";
import {StoneAbility} from "./stoneSubModels/stone-ability.model";
import {StoneSwitchState} from "./stoneSubModels/stone-switch-state.model";
import {StoneBehaviour} from "./stoneSubModels/stone-behaviour.model";

@model()
export class Stone extends SphereEntity {

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
  locationId: number;

  @belongsTo(() => StoneSwitchState)
  currentSwitchStateId: number;

  @hasMany(() => StoneAbility, {keyTo: 'stoneId'})
  abilities: StoneAbility[];

  @hasMany(() => StoneBehaviour, {keyTo: 'stoneId'})
  behaviours: StoneBehaviour[];

  @hasMany(() => StoneSwitchState, {name: 'switchStateHistory', keyTo: 'stoneId'})
  switchStateHistory: StoneSwitchState[];
}
