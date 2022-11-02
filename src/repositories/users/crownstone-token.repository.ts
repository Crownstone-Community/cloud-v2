import {DefaultCrudRepository, juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import {CrownstoneToken} from "../../models/crownstone-token.model";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {CloudUtil} from "../../util/CloudUtil";


export class CrownstoneTokenRepository extends DefaultCrudRepository<CrownstoneToken,typeof CrownstoneToken.prototype.id> {

  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(CrownstoneToken, datasource);
  }

  async create(entity: DataObject<CrownstoneToken>, options?: Options): Promise<CrownstoneToken> {
    if (!entity.id) {
      entity.id = CloudUtil.createToken();
    }
    return super.create(entity, options);
  }
}

