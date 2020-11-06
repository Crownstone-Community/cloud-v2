import {
  Getter,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  juggler,
  repository
} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {User} from "../../models/user.model";
import {Sphere} from "../../models/sphere.model";
import {Device} from "../../models/device.model";
import {SphereRepository} from "../data/sphere.repository";
import {DeviceRepository} from "../data/device.repository";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {CloudUtil} from "../../util/CloudUtil";
import {SphereAccessRepository} from "../data/sphere-access.repository";
import {SphereAccess} from "../../models/sphere-access.model";
import {HttpErrors} from "@loopback/rest";

let bcrypt = require("bcrypt");

export class UserRepository extends TimestampedCrudRepository<User,typeof User.prototype.id > {

  public spheres: HasManyThroughRepositoryFactory<Sphere, typeof Sphere.prototype.id, SphereAccess, typeof User.prototype.id>;
  public devices: HasManyRepositoryFactory<Device, typeof Device.prototype.id>;

  constructor(
    @inject('datasources.users') protected datasource: juggler.DataSource,
    @repository.getter('SphereAccessRepository') sphereAccessRepoGetter: Getter<SphereAccessRepository>,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository(DeviceRepository) protected deviceRepository: DeviceRepository,
  ) {
    super(User, datasource);
    this.spheres = this.createHasManyThroughRepositoryFactoryFor('spheres', sphereRepoGetter, sphereAccessRepoGetter);
    this.devices = this.createHasManyRepositoryFactoryFor('devices',async () => deviceRepository);
  }

  async create(entity: DataObject<User>, options?: Options): Promise<User> {
    entity.verificationToken = CloudUtil.createToken();

    if (!entity.password || entity.password.length < 1) {
      throw new HttpErrors.BadRequest("Invalid password.");
    }

    const salt = bcrypt.genSaltSync(10);
    entity.password = bcrypt.hashSync(entity.password, salt);

    return super.create(entity, options);
  }
}

