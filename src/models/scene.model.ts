import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Sphere} from "./sphere.model";

@model()
export class Scene extends AddTimestamps(BaseEntity) {
  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string'})
  stockPicture: string;

  @property({type: 'string'})
  customPictureId: string;

  @property({type: 'string'})
  data: string;

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;
}
