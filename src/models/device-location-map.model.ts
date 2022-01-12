import {belongsTo, model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {Location} from "./location.model";
import {Device} from "./device.model";
import {Sphere} from "./sphere.model";
import {User} from "./user.model";

@model()
export class DeviceLocationMap extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => Location)
  locationId: string;

  @belongsTo(() => Sphere)
  sphereId: string;

  @belongsTo(() => Device)
  deviceId: string;

  @belongsTo(() => User)
  userId: string;

}
