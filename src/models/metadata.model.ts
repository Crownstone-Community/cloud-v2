import {belongsTo, Entity, model, property} from '@loopback/repository';

@model()
export class MetaData extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true, index: true})
  type: string;

  @property({type: 'string'})
  data: string;

  @property({type: 'date', index: true})
  timestamp: Date

}
