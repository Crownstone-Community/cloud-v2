import {Entity, model, property} from '@loopback/repository';

@model({settings:{mongodb: {collection: 'OAuthAccessToken'}}})
export class OauthToken extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  appId: string

  @property({type: 'string', required: true})
  userId: string

  @property({type: 'date', required: true})
  issuedAt: Date;

  @property({type: 'number', description: "time to live in seconds"})
  expiresIn: number;

  @property({type: 'date'})
  expiredAt: Date;

  @property({type: 'array', itemType: 'string', description: "Array of scopes granted to this access token."})
  scopes: string[];

  @property({type: 'string', required: true})
  refreshToken: string;
}