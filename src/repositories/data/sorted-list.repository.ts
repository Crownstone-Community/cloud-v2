import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SortedList } from "../../models";


export class SortedListRepository extends TimestampedCrudRepository<SortedList,typeof SortedList.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(SortedList, datasource);
  }

}
