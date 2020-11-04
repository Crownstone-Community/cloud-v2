import { juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {CrownstoneTokenModel} from "../../models/crownstone-token.model";


export class CrownstoneTokenRepository extends TimestampedCrudRepository<CrownstoneTokenModel,typeof CrownstoneTokenModel.prototype.id> {

  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(CrownstoneTokenModel, datasource);
  }
}

