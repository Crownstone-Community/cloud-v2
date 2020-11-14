import { juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Bootloader } from "../../models/bootloader.model";


export class BootloaderRepository extends TimestampedCrudRepository<Bootloader,typeof Bootloader.prototype.id > {

  constructor(@inject('datasources.data') protected datasource: juggler.DataSource) {
    super(Bootloader, datasource);
  }

}
