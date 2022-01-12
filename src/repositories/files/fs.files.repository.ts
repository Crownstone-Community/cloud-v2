import {DefaultCrudRepository, juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import {FsFiles} from "../../models/gridFS/fs.files.model";


export class FsFilesRepository extends DefaultCrudRepository<FsFiles,typeof FsFiles.prototype.id> {

  constructor( @inject('datasources.files') protected datasource: juggler.DataSource ) {
    super(FsFiles, datasource);
  }


}

