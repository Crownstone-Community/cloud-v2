import {Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {App} from "../../models/app.model";


export class AppRepository extends TimestampedCrudRepository<App,typeof App.prototype.id > {
  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
  ) {
    super(App, datasource);
  }

}
