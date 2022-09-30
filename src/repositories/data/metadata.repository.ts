import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {CsCrudRepository} from "../bases/cs-crud-repository";
import {MetaData} from "../../models/metadata.model";


export class MetaDataRepository extends CsCrudRepository<MetaData,typeof MetaData.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource) {
    super(MetaData, datasource);
  }
}
