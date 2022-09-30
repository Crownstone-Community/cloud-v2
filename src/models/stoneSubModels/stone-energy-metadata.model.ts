import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Sphere} from "../sphere.model";
import {Stone} from "../stone.model";

@model()
export class EnergyMetaData extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'date', index: true})
  updatedAt: Date

  @belongsTo(() => Sphere, {name:'sphere'})
  sphereId: string;

  @belongsTo(() => Stone)
  stoneId: string;
}
