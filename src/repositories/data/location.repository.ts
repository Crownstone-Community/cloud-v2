import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {Location} from "../../models";
import {DataObject, Options} from "@loopback/repository/src/common-types";


export class LocationRepository extends TimestampedCrudRepository<Location,typeof Location.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Location, datasource);
  }

  async create(entity: DataObject<Location>, options?: Options): Promise<Location> {
    // generate uid
    return super.create(entity, options);
  }
}
