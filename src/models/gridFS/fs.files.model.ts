import {Entity, model, property} from "@loopback/repository";

@model({
  settings: {
    mongodb: {
      collection: 'fs.files',
    }
  }})
export class FsFiles extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true})
  length: number;

  @property({type: 'number', required: true})
  chunkSize: number;

  @property({type: 'date', defaultFn: 'now'})
  uploadDate: Date;

  @property({type: 'string'})
  md5: string;

  @property({type: 'string', required: true})
  filename: string;

  @property({type: 'string', required: true})
  contentType: string;

  @property({type: 'array', itemType: 'string'})
  aliases: string[];

  @property({type: 'string'})
  metadata: any;
}

