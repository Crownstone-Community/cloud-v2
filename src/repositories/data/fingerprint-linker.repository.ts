import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {Device, Fingerprint, FingerprintLinker, Location, Sphere} from "../../models";
import {SphereRepository} from "./sphere.repository";
import {LocationRepository} from "./location.repository";
import {DeviceRepository} from "./device.repository";
import {FingerprintRepository} from "./fingerprint.repository";


export class FingerprintLinkerRepository extends TimestampedCrudRepository<FingerprintLinker,typeof FingerprintLinker.prototype.id > {
  public readonly sphere:      BelongsToAccessor<Sphere,      typeof Sphere.prototype.id>;
  public readonly location:    BelongsToAccessor<Location,    typeof Location.prototype.id>;
  public readonly device:      BelongsToAccessor<Device,      typeof Device.prototype.id>;
  public readonly fingerprint: BelongsToAccessor<Fingerprint, typeof Fingerprint.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository')      sphereRepositoryGetter:      Getter<SphereRepository>,
    @repository.getter('LocationRepository')    locationRepositoryGetter:    Getter<LocationRepository>,
    @repository.getter('DeviceRepository')      deviceRepositoryGetter:      Getter<DeviceRepository>,
    @repository.getter('FingerprintRepository') fingerprintRepositoryGetter: Getter<FingerprintRepository>,
  ) {
    super(FingerprintLinker, datasource);
    this.sphere      = this.createBelongsToAccessorFor('sphere',      sphereRepositoryGetter);
    this.location    = this.createBelongsToAccessorFor('location',    locationRepositoryGetter);
    this.device      = this.createBelongsToAccessorFor('device',      deviceRepositoryGetter);
    this.fingerprint = this.createBelongsToAccessorFor('fingerprint', fingerprintRepositoryGetter);
  }

}
