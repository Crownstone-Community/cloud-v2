import {Entity, model, property,} from '@loopback/repository';

@model()
export class TimestampedEntity extends Entity {

  @property({type: 'date'})
  updatedAt: Date;

  @property({type: 'date', defaultFn: 'now' })
  createdAt: Date;

}
