import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {AppInstallation, Device} from "../../models";
import {DeviceRepository} from "./device.repository";


export class AppInstallationRepository extends TimestampedCrudRepository<AppInstallation,typeof AppInstallation.prototype.id > {
  public readonly device: BelongsToAccessor<Device, typeof Device.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('DeviceRepository') deviceRepositoryGetter: Getter<DeviceRepository>
  ) {
    super(AppInstallation, datasource);
    this.device = this.createBelongsToAccessorFor('device', deviceRepositoryGetter);
  }

}
