import {HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {User} from "../../models/user.model";
import {Sphere} from "../../models/sphere.model";
import {Device} from "../../models/device.model";
import {SphereRepository} from "../data/sphere.repository";
import {DeviceRepository} from "../data/device.repository";


export class UserRepository extends TimestampedCrudRepository<User,typeof User.prototype.id > {

  public spheres: HasManyRepositoryFactory<Sphere, typeof Sphere.prototype.id>;
  public devices: HasManyRepositoryFactory<Device, typeof Device.prototype.id>;

  constructor(
    @inject('datasources.users') protected datasource: juggler.DataSource,
    @repository(SphereRepository) protected sphereRepository: SphereRepository,
    @repository(DeviceRepository) protected deviceRepository: DeviceRepository,
  ) {
    super(User, datasource);
    this.spheres = this.createHasManyRepositoryFactoryFor('spheres',async () => sphereRepository);
    this.devices = this.createHasManyRepositoryFactoryFor('devices',async () => deviceRepository);
  }
}

