import { model, property} from '@loopback/repository';
import {StoneEntity} from "../bases/stone-entity";

@model()
export class StoneSwitchState extends StoneEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'Date', defaultFn:'now'})
  timestamp: Date;

  @property({type: 'number', required: true})
  switchState: number;

}