import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { StoneAbilityProperty } from "../../models";


export class StoneAbilityPropertyRepository extends TimestampedCrudRepository<StoneAbilityProperty,typeof StoneAbilityProperty.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(StoneAbilityProperty, datasource);
  }

}
