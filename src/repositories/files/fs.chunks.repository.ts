import {BelongsToAccessor, DefaultCrudRepository, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {FsChunks} from "../../models/gridFS/fs.chunks.model";
import {FsFiles} from "../../models/gridFS/fs.files.model";
import {FsFilesRepository} from "./fs.files.repository";


export class FsChunksRepository extends DefaultCrudRepository<FsChunks,typeof FsChunks.prototype.id> {
  public readonly fileData: BelongsToAccessor<FsFiles, typeof FsFiles.prototype.id>;

  constructor( @inject('datasources.files') protected datasource: juggler.DataSource,
               @repository.getter('FsFilesRepository') fsFilesRepo: Getter<FsFilesRepository>,
  ) {
    super(FsChunks, datasource);
    this.fileData = this.createBelongsToAccessorFor('fileData', fsFilesRepo);
  }
}

