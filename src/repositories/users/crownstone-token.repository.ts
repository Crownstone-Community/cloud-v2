import {DefaultCrudRepository, juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import {CrownstoneToken} from "../../models/crownstone-token.model";


export class CrownstoneTokenRepository extends DefaultCrudRepository<CrownstoneToken,typeof CrownstoneToken.prototype.id> {

  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(CrownstoneToken, datasource);
  }
}

