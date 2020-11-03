import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {AppInstallation, Device, DevicePreferences, FingerprintLinker, SphereTrackingNumber, User} from "../../models";
import {
  AppInstallationRepository,
  DevicePreferencesRepository,
  FingerprintLinkerRepository,
  SphereTrackingNumberRepository,
  UserRepository
} from "..";


export class DeviceRepository extends TimestampedCrudRepository<Device,typeof Device.prototype.id > {
  public readonly user: BelongsToAccessor<User, typeof User.prototype.id>;

  public installations:    HasManyRepositoryFactory<AppInstallation,      typeof AppInstallation.prototype.id>;
  public fingerprintLinks: HasManyRepositoryFactory<FingerprintLinker,    typeof FingerprintLinker.prototype.id>;
  public preferences:      HasManyRepositoryFactory<DevicePreferences,    typeof DevicePreferences.prototype.id>;
  public trackingNumber:   HasManyRepositoryFactory<SphereTrackingNumber, typeof SphereTrackingNumber.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('UserRepository') userRepositoryGetter: Getter<UserRepository>,
    @repository(AppInstallationRepository) protected appInstallationRepository: AppInstallationRepository,
    @repository(FingerprintLinkerRepository) protected fingerprintLinkerRepository: FingerprintLinkerRepository,
    @repository(DevicePreferencesRepository) protected devicePreferencesRepository: DevicePreferencesRepository,
    @repository(SphereTrackingNumberRepository) protected sphereTrackingNumberRepository: SphereTrackingNumberRepository,
  ) {
    super(Device, datasource);
    this.user = this.createBelongsToAccessorFor('owner', userRepositoryGetter);
    this.installations    = this.createHasManyRepositoryFactoryFor('installations',   async () => appInstallationRepository);
    this.fingerprintLinks = this.createHasManyRepositoryFactoryFor('fingerprintLinks',async () => fingerprintLinkerRepository);
    this.preferences      = this.createHasManyRepositoryFactoryFor('preferences',     async () => devicePreferencesRepository);
    this.trackingNumber   = this.createHasManyRepositoryFactoryFor('trackingNumber',  async () => sphereTrackingNumberRepository);

  }

}



