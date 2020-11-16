import {Count, DataObject, DefaultCrudRepository, juggler, Options, Where} from '@loopback/repository';
import { inject } from '@loopback/core';
import {OauthToken} from "../../models/oauth-token.model";

export class OauthTokenRepository extends DefaultCrudRepository<OauthToken,typeof OauthToken.prototype.id> {

  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(OauthToken, datasource);
  }

  async create(entity: DataObject<OauthToken>, options?: Options): Promise<OauthToken> {
    throw "NOT_ALLOWED";
    return super.create(entity, options);
  }

  async createAll(entities: DataObject<OauthToken>[], options?: Options): Promise<OauthToken[]> {
    throw "NOT_ALLOWED";
    return super.createAll(entities, options);
  }

  async updateAll(data: DataObject<OauthToken>, where?: Where<OauthToken>, options?: Options): Promise<Count> {
    throw "NOT_ALLOWED";
    return super.updateAll(data, where, options);
  }

  async replaceById(id: typeof OauthToken.prototype.id, data: DataObject<OauthToken>, options?: Options): Promise<void> {
    throw "NOT_ALLOWED";
    return super.replaceById(id, data, options);
  }
}

