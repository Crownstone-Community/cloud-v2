import {model, property} from '@loopback/repository';
import {ActiveDays} from "../subModels/active-days.model";
import {StoneEntity} from "../bases/stone-entity";

@model()
export class StoneBehaviour extends StoneEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  type: string;

  @property({type: 'boolean', required: true})
  data: string;

  @property({type: 'boolean', required: true})
  syncedToCrownstone: string;

  @property({type: 'number'})
  idOnCrownstone: number;

  @property({type: 'number'})
  profileIndex: number;

  @property({type: 'boolean'})
  deleted: boolean;

  @property()
  activeDays: ActiveDays



}