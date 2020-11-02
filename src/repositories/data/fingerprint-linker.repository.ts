import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { FingerprintLinker } from "../../models";


export class FingerprintLinkerRepository extends TimestampedCrudRepository<FingerprintLinker,typeof FingerprintLinker.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(FingerprintLinker, datasource);
  }

}
