import {model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class SphereKey extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  keyType: string;

  @property({type: 'string', required: true})
  key: string;
}