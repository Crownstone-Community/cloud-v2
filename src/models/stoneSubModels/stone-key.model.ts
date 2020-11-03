import {model, property} from '@loopback/repository';
import {StoneEntity} from "../bases/stone-entity";

@model()
export class StoneKey extends StoneEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  keyType: string;

  @property({type: 'string', required: true})
  key: string;

  @property({type: 'number', required: true})
  ttl: number;
}