import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class SortedList extends AddTimestamps(BaseEntity) {
  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  viewKey: string;

  @property({type: 'string'})
  referenceId: string;

  @property({type: 'string'})
  sortedList: string; // stringified list

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
