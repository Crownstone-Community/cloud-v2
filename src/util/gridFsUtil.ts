import {Dbs} from "../modules/containers/RepoContainer";
import {FsFiles} from "../models/gridFS/fs.files.model";

export const GridFsUtil = {

  async downloadFileFromId(fileId: string) : Promise<{ meta: FsFiles, data: Buffer }> {
    let fileMeta = await Dbs.fsFiles.findById(fileId)
    let chunks   = await Dbs.fsChunks.find({where:{files_id: fileId}});

    let combinedBuffer = Buffer.from('');

    for (let chunk of chunks) {
      combinedBuffer = Buffer.concat([combinedBuffer, chunk.data])
    }

    return {meta: fileMeta, data: combinedBuffer}
  }

}