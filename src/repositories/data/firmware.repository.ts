import { juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {Firmware} from "../../models/firmware.model";


export class FirmwareRepository extends TimestampedCrudRepository<Firmware,typeof Firmware.prototype.id > {

  constructor(@inject('datasources.data') protected datasource: juggler.DataSource) {
    super(Firmware, datasource);
  }

}
