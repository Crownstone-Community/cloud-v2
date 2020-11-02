import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereTrackingNumber } from "../../models";


export class SphereTrackingNumberRepository extends TimestampedCrudRepository<SphereTrackingNumber,typeof SphereTrackingNumber.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(SphereTrackingNumber, datasource);
  }

}
