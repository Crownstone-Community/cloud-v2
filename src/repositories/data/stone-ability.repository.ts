import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { StoneAbility } from "../../models";


export class StoneAbilityRepository extends TimestampedCrudRepository<StoneAbility,typeof StoneAbility.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(StoneAbility, datasource);
  }

}
