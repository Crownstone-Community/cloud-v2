import { juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {Hub} from "../../models";


export class HubRepository extends TimestampedCrudRepository<Hub,typeof Hub.prototype.id > {
  constructor( @inject('datasources.users') protected datasource: juggler.DataSource ) {
    super(Hub, datasource);
  }
}

