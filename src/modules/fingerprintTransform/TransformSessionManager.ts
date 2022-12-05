import {TransformSession} from "./TransformSession";
import {Util} from "../../util/Util";


class TransformSessionManagerClass {
  activeSessions : Record<uuid, TransformSession> = {};


  /**
   * The sphereId is used for authenticated routing of sse events
   * @param sphereId
   * @param userId_A
   * @param phoneType_A
   * @param userId_B
   * @param phoneType_B
   */
  async createNewSession(sphereId: string, userId_A: string, phoneType_A: string, userId_B: string, phoneType_B: string) : Promise<uuid> {
    let id = Util.getUUID();
    let session = new TransformSession(
      id,
      sphereId,
      () => { delete this.activeSessions[id]; },
      userId_A, phoneType_A, userId_B, phoneType_B
    );

    this.activeSessions[session.id] = session;

    await session.init(); // this can throw an error.
    return id;
  }

  killSession(sessionUUID : uuid) {
    if (this.activeSessions[sessionUUID]) {
      this.activeSessions[sessionUUID].cleanup();
    }
  }

  joinSession(sessionUUID : uuid, userId: string) {
    if (this.activeSessions[sessionUUID]) {
      this.activeSessions[sessionUUID].joinSession(userId);
    }
    else {
      throw new Error("Session not found");
    }
  }

  startDatasetCollection(sessionUUID: uuid) : uuid {
    if (this.activeSessions[sessionUUID]) {
      return this.activeSessions[sessionUUID].startDatasetCollection();
    }
    throw new Error("Session not found");
  }

  finishedCollectingDataset(sessionUUID : uuid, datasetUUID: uuid, userId: string, dataset: MeasurementMap) {
    if (this.activeSessions[sessionUUID]) {
      this.activeSessions[sessionUUID].finishedCollectingDataset(userId, datasetUUID, dataset);
    }
    else {
      throw new Error("Session not found");
    }
  }

  generateTransformSets(sessionUUID : uuid) : TransformResult {
    if (this.activeSessions[sessionUUID]) {
      return this.activeSessions[sessionUUID].generateTransformSets();
    }
    throw new Error("Session not found");
  }

}


export const TransformSessionManager = new TransformSessionManagerClass();