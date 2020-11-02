import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Message } from "../../models";


export class MessageRepository extends TimestampedCrudRepository<Message,typeof Message.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Message, datasource);
  }

}
