import {Entity, model, property, belongsTo,} from '@loopback/repository';
import {SphereEntity} from "./bases/sphere-entity";

@model()
export class Toon extends SphereEntity {

  @property({type: 'string', id: true})
  id: string;

  @property({type:'string', required: true})
  toonAgreementId: string

  @property({type:'string', required: false})
  toonAddress: string

  @property({type:'string', required: true})
  refreshToken: string

  @property({type:'number', required: true})
  refreshTokenTTL: number

  @property({type:'number', required: true})
  refreshTokenUpdatedAt: number

  @property({type:'string', required: true})
  refreshTokenUpdatedFrom: number

  @property({type:'string'})
  schedule: string

  @property({type:'number', default: 0})
  updatedScheduleTime: number

  @property({type:'string', default: "NONE"})
  changedToProgram: string

  @property({type:'number', default: 0})
  changedProgramTime: number
}
