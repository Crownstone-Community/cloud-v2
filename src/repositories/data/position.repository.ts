import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Position } from "../../models";


export class PositionRepository extends TimestampedCrudRepository<Position,typeof Position.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Position, datasource);
  }

}
