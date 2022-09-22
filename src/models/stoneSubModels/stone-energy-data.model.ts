import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";

@model()
export class EnergyData extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number'})
  energyUsage: number;

  @property({type: 'number'})
  correctedEnergyUsage: number;

  @property({type: 'date', index: true})
  timestamp: Date

  @property({ type:'boolean', index: true, default: false })
  checked: boolean

  @property({ type:'boolean', index: true, default: false })
  processed: boolean

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;
}
