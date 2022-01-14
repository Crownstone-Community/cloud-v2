import {Count, DataObject, DefaultCrudRepository, juggler, Options, Where} from '@loopback/repository';
import { inject } from '@loopback/core';
import {OauthToken} from "../../models/oauth-token.model";
import {CONFIG} from "../../config";

export class OauthTokenRepository extends DefaultCrudRepository<OauthToken,typeof OauthToken.prototype.id> {

  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(OauthToken, datasource);
  }

  async create(entity: DataObject<OauthToken>, options?: Options): Promise<OauthToken> {
    if (CONFIG.unittesting === false) {
      throw "NOT_ALLOWED_TO_MODIFY_OAUTH_TOKENS";
    }
    return super.create(entity, options);
  }

  async createAll(entities: DataObject<OauthToken>[], options?: Options): Promise<OauthToken[]> {
    throw "NOT_ALLOWED_TO_MODIFY_OAUTH_TOKENS";
    return super.createAll(entities, options);
  }

  async updateAll(data: DataObject<OauthToken>, where?: Where<OauthToken>, options?: Options): Promise<Count> {
    throw "NOT_ALLOWED_TO_MODIFY_OAUTH_TOKENS";
    return super.updateAll(data, where, options);
  }

  async replaceById(id: typeof OauthToken.prototype.id, data: DataObject<OauthToken>, options?: Options): Promise<void> {
    throw "NOT_ALLOWED_TO_MODIFY_OAUTH_TOKENS";
    return super.replaceById(id, data, options);
  }
}

