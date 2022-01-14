import { inject } from '@loopback/core';
import {FsFiles} from "../../models/gridFS/fs.files.model";
import {CsCrudRepository} from "../bases/cs-crud-repository";
import {juggler} from "@loopback/repository";


export class FsFilesRepository extends CsCrudRepository<FsFiles,typeof FsFiles.prototype.id> {

  constructor( @inject('datasources.files') protected datasource: juggler.DataSource ) {
    super(FsFiles, datasource);
  }


}

