import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";

@model()
export class EnergyDataProcessed extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number'})
  energyUsage: number;

  @property({type: 'date', index: true})
  timestamp: Date

  @property({ type:'string', index: true, default: '1m' })
  interval: EnergyInterval

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;
}
