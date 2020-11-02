import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { MessageUser } from "../../models";


export class MessageUserRepository extends TimestampedCrudRepository<MessageUser,typeof MessageUser.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(MessageUser, datasource);
  }

}
