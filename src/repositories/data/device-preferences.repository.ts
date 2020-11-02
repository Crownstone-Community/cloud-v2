import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { DevicePreferences } from "../../models";


export class DevicePreferencesRepository extends TimestampedCrudRepository<DevicePreferences,typeof DevicePreferences.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(DevicePreferences, datasource);
  }

}
