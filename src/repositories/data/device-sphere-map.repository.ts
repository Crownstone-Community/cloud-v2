import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {Device} from "../../models/device.model";
import {User} from "../../models/user.model";
import {UserRepository} from "../users/user.repository";
import {DeviceSphereMap} from "../../models/device-sphere-map.model";
import {Sphere} from "../../models/sphere.model";
import {DeviceRepository} from "./device.repository";
import {SphereRepository} from "./sphere.repository";


export class DeviceSphereMapRepository extends TimestampedCrudRepository<DeviceSphereMap,typeof Device.prototype.id > {
  public readonly user: BelongsToAccessor<User, typeof User.prototype.id>;
  public readonly device: BelongsToAccessor<Device, typeof Device.prototype.id>;
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>,
    @repository.getter('DeviceRepository') deviceRepoGetter: Getter<DeviceRepository>,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
  ) {
    super(DeviceSphereMap, datasource);
    this.user = this.createBelongsToAccessorFor('owner', userRepoGetter);
    this.device = this.createBelongsToAccessorFor('device', deviceRepoGetter);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }

}



