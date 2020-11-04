import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {LocationRepository} from "./location.repository";
import {DeviceRepository} from "./device.repository";
import {FingerprintRepository} from "./fingerprint.repository";
import {FingerprintLinker} from "../../models/fingerprint-linker.model";
import {Sphere} from "../../models/sphere.model";
import {Location} from "../../models/location.model";
import {Device} from "../../models/device.model";
import {Fingerprint} from "../../models/fingerprint.model";


export class FingerprintLinkerRepository extends TimestampedCrudRepository<FingerprintLinker,typeof FingerprintLinker.prototype.id > {
  public readonly sphere:      BelongsToAccessor<Sphere,      typeof Sphere.prototype.id>;
  public readonly location:    BelongsToAccessor<Location,    typeof Location.prototype.id>;
  public readonly device:      BelongsToAccessor<Device,      typeof Device.prototype.id>;
  public readonly fingerprint: BelongsToAccessor<Fingerprint, typeof Fingerprint.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository')      sphereRepoGetter:      Getter<SphereRepository>,
    @repository.getter('LocationRepository')    locationRepoGetter:    Getter<LocationRepository>,
    @repository.getter('DeviceRepository')      deviceRepoGetter:      Getter<DeviceRepository>,
    @repository.getter('FingerprintRepository') fingerprintRepoGetter: Getter<FingerprintRepository>,
  ) {
    super(FingerprintLinker, datasource);
    this.sphere      = this.createBelongsToAccessorFor('sphere',      sphereRepoGetter);
    this.location    = this.createBelongsToAccessorFor('location',    locationRepoGetter);
    this.device      = this.createBelongsToAccessorFor('device',      deviceRepoGetter);
    this.fingerprint = this.createBelongsToAccessorFor('fingerprint', fingerprintRepoGetter);
  }

}
