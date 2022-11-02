import {Dbs} from "../modules/containers/RepoContainer";
import {FsFiles} from "../models/gridFS/fs.files.model";
import {FsChunks} from "../models/gridFS/fs.chunks.model";

export const GridFsUtil = {

  async downloadFileFromId(fileId: string) : Promise<{ meta: FsFiles, data: Buffer, chunks: FsChunks[] }> {
    let fileMeta = await Dbs.fsFiles.findById(fileId)
    let chunks   = await Dbs.fsChunks.find({where:{files_id: fileId}});

    let combinedBuffer = Buffer.from('');

    for (let chunk of chunks) {
      combinedBuffer = Buffer.concat([combinedBuffer, chunk.data])
    }

    return {meta: fileMeta, data: combinedBuffer, chunks: chunks}
  },

  async storeFile(chunksData: FsChunks[], metaData: Partial<FsFiles>) : Promise<void> {
    if (metaData.id) {
      try {
        // do not create doubly
        await Dbs.fsFiles.findById(metaData.id);
        return;
      }
      catch (err) {
        // do nothing
      }
    }

    // store the metadata first, since this gives us a file id
    let fileMeta = await Dbs.fsFiles.create(metaData);

    for (let chunk of chunksData) {
      chunk.files_id = fileMeta.id;
      await Dbs.fsChunks.create(chunk);
    }
    // now we can store the chunks
    // let chunkCount = Math.ceil(fileData.length / metaData.chunkSize);
    // for (let i = 0; i < chunkCount; i++) {
    //   let chunk = {
    //     files_id: fileMeta.id,
    //     n: i,
    //     data: Buffer.from(fileData.substr(i * metaData.chunkSize, metaData.chunkSize))
    //   }
    //   await Dbs.fsChunks.create(chunk);
    // }
  }

}