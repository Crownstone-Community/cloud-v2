import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Fingerprint } from "../../models";


export class FingerprintRepository extends TimestampedCrudRepository<Fingerprint,typeof Fingerprint.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Fingerprint, datasource);
  }

}
