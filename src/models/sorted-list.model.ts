import { model, property, hasMany, belongsTo,} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class SortedList extends SphereEntity {
  constructor(data?: Partial<EventListener>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  viewKey: string;

  @property({type: 'string'})
  referenceId: string;

  @property({type: 'string'})
  sortedList: string; // stringified list

}
