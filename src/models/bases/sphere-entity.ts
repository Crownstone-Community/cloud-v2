import {Entity, model, belongsTo, property,} from '@loopback/repository';
import {Sphere} from "../sphere.model";
import {TimestampedEntity} from "./timestamped-entity";

@model()
export class SphereEntity extends TimestampedEntity {

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: number;
}
