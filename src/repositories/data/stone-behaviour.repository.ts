import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { StoneBehaviour } from "../../models";


export class StoneBehaviourRepository extends TimestampedCrudRepository<StoneBehaviour,typeof StoneBehaviour.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(StoneBehaviour, datasource);
  }

}
