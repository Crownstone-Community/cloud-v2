import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereFeature } from "../../models";


export class SphereFeatureRepository extends TimestampedCrudRepository<SphereFeature,typeof SphereFeature.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(SphereFeature, datasource);
  }

}
