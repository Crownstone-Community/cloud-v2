import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereAccess } from "../../models";


export class SphereAccessRepository extends TimestampedCrudRepository<SphereAccess,typeof SphereAccess.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(SphereAccess, datasource);
  }

}
