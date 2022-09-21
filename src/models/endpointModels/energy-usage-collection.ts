import {Entity, model, property} from '@loopback/repository';

@model()
export class EnergyUsageCollection extends Entity {

  @property({required: true})
  stoneId: string;

  @property({ required: true })
  energyUsage: number;

  @property({type: 'date', required: true})
  timestamp: Date;

}
