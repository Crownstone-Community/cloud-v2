import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { AppInstallation } from "../../models";


export class AppInstallationRepository extends TimestampedCrudRepository<AppInstallation,typeof AppInstallation.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(AppInstallation, datasource);
  }

}
