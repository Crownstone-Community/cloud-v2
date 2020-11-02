import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Device } from "../../models";


export class DeviceRepository extends TimestampedCrudRepository<Device,typeof Device.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Device, datasource);
  }

}
