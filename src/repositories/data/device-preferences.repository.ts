import {BelongsToAccessor, juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Device, DevicePreferences } from "../../models";


export class DevicePreferencesRepository extends TimestampedCrudRepository<DevicePreferences,typeof DevicePreferences.prototype.id > {
  public readonly device: BelongsToAccessor<Device, typeof Device.prototype.id>;

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(DevicePreferences, datasource);
  }

}
