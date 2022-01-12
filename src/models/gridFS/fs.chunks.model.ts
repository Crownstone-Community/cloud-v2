import {belongsTo, Entity, model, property} from "@loopback/repository";
import {FsFiles} from "./fs.files.model";

@model({
  settings: {
    mongodb: {
      collection: 'fs.chunks',
    }
  }})
export class FsChunks extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @belongsTo(() => FsFiles, {name:'fileData'})
  files_id: string;

  @property({type: 'number', required: true})
  n: number;

  @property({type: 'buffer'})
  data: Buffer;

}
