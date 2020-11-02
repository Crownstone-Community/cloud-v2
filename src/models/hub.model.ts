import {model, property} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class Hub extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;

  @property({type: 'string', required: true})
  token: string;

  @property({type: 'string'})
  localIPAddress: string;

  @property({type: 'string'})
  externalIPAddress: string;

  @property({type: 'string'})
  state: string;

  @property({type: 'date'})
  lastSeen: Date

}
