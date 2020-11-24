import {Entity, model, property} from '@loopback/repository';

@model({settings:{mongodb: {collection: 'CrownstoneAccessToken'}}})
export class CrownstoneToken extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  userId: string;

  @property({type: 'date', defaultFn: 'now'})
  created: Date;

  @property({type: 'number', default: 1209600, description: "time to live in seconds (2 weeks by default)"})
  ttl: number;

  @property({type: 'string', required: true})
  principalType: string;

  @property({type: 'array', itemType: 'string', description: "Array of scopes granted to this access token."})
  scopes: string[];
}
