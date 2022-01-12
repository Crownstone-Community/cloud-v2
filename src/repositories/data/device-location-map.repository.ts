import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {Device} from "../../models/device.model";
import {User} from "../../models/user.model";
import {UserRepository} from "../users/user.repository";
import {Sphere} from "../../models/sphere.model";
import {DeviceRepository} from "./device.repository";
import {SphereRepository} from "./sphere.repository";
import {DeviceLocationMap} from "../../models/device-location-map.model";
import {Location} from "../../models/location.model";
import {LocationRepository} from "./location.repository";


export class DeviceLocationMapRepository extends TimestampedCrudRepository<DeviceLocationMap,typeof Device.prototype.id > {
  public readonly user: BelongsToAccessor<User, typeof User.prototype.id>;
  public readonly device: BelongsToAccessor<Device, typeof Device.prototype.id>;
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly location: BelongsToAccessor<Location, typeof Location.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>,
    @repository.getter('DeviceRepository') deviceRepoGetter: Getter<DeviceRepository>,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('LocationRepository') locationRepoGetter: Getter<LocationRepository>,
  ) {
    super(DeviceLocationMap, datasource);
    this.user     = this.createBelongsToAccessorFor('owner', userRepoGetter);
    this.device   = this.createBelongsToAccessorFor('device', deviceRepoGetter);
    this.location = this.createBelongsToAccessorFor('location', locationRepoGetter);
    this.sphere   = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }

}



