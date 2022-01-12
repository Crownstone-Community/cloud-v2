import {
  BelongsToAccessor,
  Getter,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  juggler,
  repository
} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {AppInstallation} from "../../models/app-installation.model";
import { FingerprintLinker } from '../../models/fingerprint-linker.model';
import {Device} from "../../models/device.model";
import {User} from "../../models/user.model";
import {DevicePreferences} from "../../models/device-preferences.model";
import {UserRepository} from "../users/user.repository";
import {AppInstallationRepository} from "./app-installation.repository";
import {FingerprintLinkerRepository} from "./fingerprint-linker.repository";
import {DevicePreferencesRepository} from "./device-preferences.repository";
import {DeviceLocationMap} from "../../models/device-location-map.model";
import {DeviceSphereMap} from "../../models/device-sphere-map.model";
import {DeviceLocationMapRepository} from "./device-location-map.repository";
import {DeviceSphereMapRepository} from "./device-sphere-map.repository";


export class DeviceRepository extends TimestampedCrudRepository<Device,typeof Device.prototype.id > {
  public readonly user: BelongsToAccessor<User, typeof User.prototype.id>;

  public installations:    HasManyRepositoryFactory<AppInstallation,      typeof AppInstallation.prototype.id>;
  public fingerprintLinks: HasManyRepositoryFactory<FingerprintLinker,    typeof FingerprintLinker.prototype.id>;
  public preferences:      HasManyRepositoryFactory<DevicePreferences,    typeof DevicePreferences.prototype.id>;

  public locationMap:      HasOneRepositoryFactory<DeviceLocationMap,    typeof DeviceLocationMap.prototype.id>;
  public sphereMap:        HasOneRepositoryFactory<DeviceSphereMap,      typeof DeviceSphereMap.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>,
    @repository(AppInstallationRepository)   protected appInstallationRepo:   AppInstallationRepository,
    @repository(FingerprintLinkerRepository) protected fingerprintLinkerRepo: FingerprintLinkerRepository,
    @repository(DevicePreferencesRepository) protected devicePreferencesRepo: DevicePreferencesRepository,
    @repository(DeviceLocationMapRepository) protected locationMapRepo:       DeviceLocationMapRepository,
    @repository(DeviceSphereMapRepository)   protected sphereMapRepo:         DeviceSphereMapRepository,
  ) {
    super(Device, datasource);
    this.user = this.createBelongsToAccessorFor('owner', userRepoGetter);
    this.installations    = this.createHasManyRepositoryFactoryFor('installations',   async () => appInstallationRepo);
    this.fingerprintLinks = this.createHasManyRepositoryFactoryFor('fingerprintLinks',async () => fingerprintLinkerRepo);
    this.preferences      = this.createHasManyRepositoryFactoryFor('preferences',     async () => devicePreferencesRepo);

    this.locationMap      = this.createHasOneRepositoryFactoryFor('locationMap',     async () => locationMapRepo);
    this.sphereMap        = this.createHasOneRepositoryFactoryFor('sphereMap',       async () => sphereMapRepo);

    this.registerInclusionResolver('installations',     this.installations.inclusionResolver);
    this.registerInclusionResolver('fingerprintLinks',  this.fingerprintLinks.inclusionResolver);
    this.registerInclusionResolver('preferences',       this.preferences.inclusionResolver);
    this.registerInclusionResolver('locationMap',       this.locationMap.inclusionResolver);
    this.registerInclusionResolver('sphereMap',         this.sphereMap.inclusionResolver);
  }

}



