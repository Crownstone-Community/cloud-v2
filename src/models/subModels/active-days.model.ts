import {Entity, model, property} from '@loopback/repository';

@model()
export class ActiveDays extends Entity {
  @property({type: 'boolean', required: true})
  Mon: boolean;

  @property({type: 'boolean', required: true})
  Tue: boolean;

  @property({type: 'boolean', required: true})
  Wed: boolean;

  @property({type: 'boolean', required: true})
  Thu: boolean;

  @property({type: 'boolean', required: true})
  Fri: boolean;

  @property({type: 'boolean', required: true})
  Sat: boolean;

  @property({type: 'boolean', required: true})
  Sun: boolean;
}
