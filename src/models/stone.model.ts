import {belongsTo, hasMany, hasOne, model, property} from '@loopback/repository';
import {StoneAbility} from "./stoneSubModels/stone-ability.model";
import {StoneSwitchState} from "./stoneSubModels/stone-switch-state.model";
import {StoneBehaviour} from "./stoneSubModels/stone-behaviour.model";
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Location} from "./location.model";
import {Sphere} from "./sphere.model";
import {UicrData} from "./subModels/uicr.model";
import {EnergyData} from "./stoneSubModels/stone-energy-data.model";
import {EnergyDataProcessed} from "./stoneSubModels/stone-energy-data-processed.model";
import {EnergyMetaData} from "./stoneSubModels/stone-energy-metadata.model";

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

  @property()
  uicr: UicrData

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

  @hasMany(() => EnergyData, {name: 'energyData', keyTo: 'stoneId'})
  energyData: EnergyData[];

  @hasMany(() => EnergyDataProcessed, {name: 'energyDataProcessed', keyTo: 'stoneId'})
  energyDataProcessed: EnergyDataProcessed[];

  @hasMany(() => EnergyMetaData, {name: 'energyMetaData', keyTo: 'stoneId'})
  energyMetaData: EnergyMetaData[];

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
