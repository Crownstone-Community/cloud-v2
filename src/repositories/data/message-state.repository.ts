import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { MessageState } from "../../models";


export class MessageStateRepository extends TimestampedCrudRepository<MessageState,typeof MessageState.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(MessageState, datasource);
  }

}
