import {Entity, model, property} from '@loopback/repository';

@model()
export class EnergyUsageCollection extends Entity {

  @property({required: true})
  stoneId: string;

  @property({ required: true })
  energy: number;

  @property({type: 'date', required: true})
  t: Date;

}

