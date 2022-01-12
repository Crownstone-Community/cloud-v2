import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Device} from "./device.model";
import {Sphere} from "./sphere.model";
import {User} from "./user.model";

@model()
export class DeviceSphereMap extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => Sphere, {name: 'sphere'})
  sphereId: string;

  @belongsTo(() => Device, {name: 'device'})
  deviceId: string;

  @belongsTo(() => User, {name: 'owner'})
  userId: string;

}

