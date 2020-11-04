import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
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


export class DeviceRepository extends TimestampedCrudRepository<Device,typeof Device.prototype.id > {
  public readonly user: BelongsToAccessor<User, typeof User.prototype.id>;

  public installations:    HasManyRepositoryFactory<AppInstallation,      typeof AppInstallation.prototype.id>;
  public fingerprintLinks: HasManyRepositoryFactory<FingerprintLinker,    typeof FingerprintLinker.prototype.id>;
  public preferences:      HasManyRepositoryFactory<DevicePreferences,    typeof DevicePreferences.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>,
    @repository(AppInstallationRepository) protected   appInstallationRepo: AppInstallationRepository,
    @repository(FingerprintLinkerRepository) protected fingerprintLinkerRepo: FingerprintLinkerRepository,
    @repository(DevicePreferencesRepository) protected devicePreferencesRepo: DevicePreferencesRepository,
  ) {
    super(Device, datasource);
    this.user = this.createBelongsToAccessorFor('owner', userRepoGetter);
    this.installations    = this.createHasManyRepositoryFactoryFor('installations',   async () => appInstallationRepo);
    this.fingerprintLinks = this.createHasManyRepositoryFactoryFor('fingerprintLinks',async () => fingerprintLinkerRepo);
    this.preferences      = this.createHasManyRepositoryFactoryFor('preferences',     async () => devicePreferencesRepo);

  }

}



