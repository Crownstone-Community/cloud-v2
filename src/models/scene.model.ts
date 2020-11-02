import {model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class Scene extends SphereEntity {
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
}
