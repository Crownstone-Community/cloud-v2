import { juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {User} from "../../models";


export class UserRepository extends TimestampedCrudRepository<User,typeof User.prototype.id > {

  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(User, datasource);
  }
}

