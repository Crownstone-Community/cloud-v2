import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {DevicePreferences} from "../../models/device-preferences.model";
import {Device} from "../../models/device.model";
import {DeviceRepository} from "./device.repository";


export class DevicePreferencesRepository extends TimestampedCrudRepository<DevicePreferences,typeof DevicePreferences.prototype.id > {
  public readonly device: BelongsToAccessor<Device, typeof Device.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('DeviceRepository') deviceRepoGetter: Getter<DeviceRepository>
  ) {
    super(DevicePreferences, datasource);
    this.device = this.createBelongsToAccessorFor('device', deviceRepoGetter);
  }

}
