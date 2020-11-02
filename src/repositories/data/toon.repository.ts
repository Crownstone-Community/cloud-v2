import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Toon } from "../../models";


export class ToonRepository extends TimestampedCrudRepository<Toon,typeof Toon.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Toon, datasource);
  }

}
