import {Entity, model, property} from '@loopback/repository';

@model()
export class UicrData extends Entity {
  @property({type: 'number'})
  board: number;
  
  @property({type: 'number'})
  productType: number;

  @property({type: 'number'})
  region: number;

  @property({type: 'number'})
  productFamily: number;

  @property({type: 'number'})
  reserved1: number;

  @property({type: 'number'})
  hardwarePatch: number;

  @property({type: 'number'})
  hardwareMinor: number;

  @property({type: 'number'})
  hardwareMajor: number;

  @property({type: 'number'})
  reserved2: number;

  @property({type: 'number'})
  productHousing: number;

  @property({type: 'number'})
  productionWeek: number;

  @property({type: 'number'})
  productionYear: number;

  @property({type: 'number'})
  reserved3: number;
}
