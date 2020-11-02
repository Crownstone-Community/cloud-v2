import {model, belongsTo} from '@loopback/repository';
import {SphereEntity} from "./sphere-entity";
import {Stone} from "../stone.model";

@model()
export class StoneEntity extends SphereEntity {

  @belongsTo(() => Stone)
  stoneId: number;
}
