import {Util} from "../../util/Util";
import {TransformUtil} from "./TransformUtil";
import {User} from "../../models/user.model";
import {Sphere} from "../../models/sphere.model";
import {Dbs} from "../containers/RepoContainer";
import {EventHandler} from "../sse/EventHandler";


export class TransformSession {
  id: uuid;
  sphereId: string;
  destructor : () => void;
  cleanupTimeout : NodeJS.Timeout;

  userA: User;
  userB: User;
  sphere: Sphere

  userId_A: string;
  userId_B: string;
  deviceId_A: string;
  deviceId_B: string;

  invitePending: boolean = false;

  datasets: {[uuid:string] : {setA: MeasurementMap, setB: MeasurementMap}} = {};

  inviteInterval : NodeJS.Timeout;
  inviteTimeout  : NodeJS.Timeout;

  constructor(id: uuid, sphereId: string, destructor: () => void, userId_A: string, deviceId_A: string, userId_B: string, deviceId_B: string) {
    this.id = id;
    this.sphereId = sphereId;
    this.destructor = destructor;

    this.cleanupTimeout = setTimeout(() => {
      this.cleanup();
    }, 30*60*1000); // 30 minutes

    this.userId_A = userId_A;
    this.userId_B = userId_B;
    this.deviceId_A = deviceId_A;
    this.deviceId_B = deviceId_B;
  }

  async init() : Promise<void> {
    try {
      this.userA = await Dbs.user.findById(this.userId_A);
      this.userB = await Dbs.user.findById(this.userId_B);
      this.sphere = await Dbs.sphere.findById(this.sphereId);

      this.invitePending = true;
      this.inviteInterval = setInterval(() => {
        if (this.invitePending === false) {
          this._stopInviting();
        }

        // This acts as an invitation. The other user will join the session by calling the joinSession function.
        EventHandler.transform.sendTransformSessionRequestedEvent(
          this.sphere,
          this.id,
          this.userA,
          this.userB,
          this.deviceId_A,
          this.deviceId_B
        );
      }, 2000);

      this.inviteTimeout = setTimeout(() => {
        this._stopInviting();
      }, 60 * 1000); // 1 minute
    }
    catch (err: any) {
      console.log("Failed to init transform session", err);
      this.cleanup();
      throw err;
    }

  }

  _stopInviting() {
     clearTimeout(this.inviteTimeout);
     clearInterval(this.inviteInterval);
     if (this.invitePending === true) {
       this.cleanup();
     }
  }

  joinSession(userId: string) {
    if (this.userId_B === userId) {
      this.invitePending = false;
      this._stopInviting();
      EventHandler.transform.sendTransformSessionReadyEvent(
        this.sphere,
        this.id,
        this.userA,
        this.userB,
        this.deviceId_A,
        this.deviceId_B
      );
    }
    else {
      throw new Error("User is not invited to this session.");
    }
  }

  cleanup() {
    clearTimeout(this.inviteTimeout);
    clearInterval(this.inviteInterval);
    clearTimeout(this.cleanupTimeout);
    this.destructor();

    EventHandler.transform.sendTransformSessionStoppedEvent(
      this.sphere,
      this.id,
    );
  }

  startDatasetCollection() : uuid {
    let datasetId = Util.getUUID();
    this.datasets[datasetId] = {setA: null, setB: null};
    EventHandler.transform.sendTransformDatacollectionStartedEvent(
      this.sphere,
      this.id,
      datasetId,
    );
    return datasetId;
  }

  finishedCollectingDataset(userId: string, datasetUUID: uuid, deviceId: string, dataset: MeasurementMap) {
    if (this.datasets[datasetUUID] === undefined) { throw new Error("Dataset not found"); }

    if (userId === this.userId_A && this.deviceId_A == this.deviceId_A && this.datasets[datasetUUID].setA === null) {
      this.datasets[datasetUUID].setA = dataset;
      if (this.datasets[datasetUUID].setB === null) {
        EventHandler.transform.sendTransformDatacollectionReceivedEvent(
          this.sphere,
          this.id,
          datasetUUID,
          this.userA,
          this.deviceId_A
        );
      }
    }
    else if (userId === this.userId_A && this.deviceId_A == this.deviceId_A && this.datasets[datasetUUID].setA !== null) {
      throw new Error("Already received dataset from user A for this collection session.");
    }
    else if (userId === this.userId_B && this.deviceId_B == this.deviceId_B && this.datasets[datasetUUID].setB === null) {
      this.datasets[datasetUUID].setB = dataset;
      if (this.datasets[datasetUUID].setA === null) {
        EventHandler.transform.sendTransformDatacollectionReceivedEvent(
          this.sphere,
          this.id,
          datasetUUID,
          this.userB,
          this.deviceId_B
        );
      }
    }
    else if (userId === this.userId_B && this.deviceId_B == this.deviceId_B && this.datasets[datasetUUID].setB !== null) {
      throw new Error("Already received dataset from user B for this collection session.");
    }

    if (this.datasets[datasetUUID].setA !== null && this.datasets[datasetUUID].setB !== null) {
      let qualityResult = getDatasetQuality(this.datasets);
      EventHandler.transform.sendTransformDatacollectionFinishedEvent(
        this.sphere,
        this.id,
        datasetUUID,
        qualityResult
      );
    }
  }

  generateTransformSets() : TransformResult {
    let aToB = this._generateTransformSetDirection(true);
    let bToA = this._generateTransformSetDirection(false);
    let result = [
      {sessionId: this.id, fromUser: this.userA.id, fromDevice: this.deviceId_A, toUser: this.userB.id, toDevice: this.deviceId_B, transform: aToB},
      {sessionId: this.id, fromUser: this.userB.id, fromDevice: this.deviceId_B, toUser: this.userA.id, toDevice: this.deviceId_A, transform: bToA}
    ];
    EventHandler.transform.sendTransformSetFinishedEvent(
      this.sphere,
      this.id,
      result,
    );
    return result;
  }


  _generateTransformSetDirection(aToB:boolean) {
    let fromMaps : MeasurementMap[] = [];
    let toMaps   : MeasurementMap[] = [];
    for (let datasetId in this.datasets) {
      if (this.datasets[datasetId].setA !== null && this.datasets[datasetId].setB !== null) {
        if (aToB) {
          fromMaps.push(this.datasets[datasetId].setA);
          toMaps.push(this.datasets[datasetId].setB);
        }
        else {
          fromMaps.push(this.datasets[datasetId].setB);
          toMaps.push(this.datasets[datasetId].setA);
        }
      }
    }

    if (fromMaps.length === 0) {
      throw new Error("No complete datasets found.");
    }

    return this._generateTransformSet(fromMaps, toMaps);
  }

  _generateTransformSet(sets_From:MeasurementMap[], sets_To:MeasurementMap[]) : TransformSet {
    return TransformUtil.getTransFormSet(sets_From, sets_To);
  }
}

function getDatasetQuality(datasets: {[uuid:string] : {setA: MeasurementMap, setB: MeasurementMap}}) : {userA: Record<string, number>, userB: Record<string, number>} {
  let comparisonArray_AtoB : TransformArray = [];
  let comparisonArray_BtoA : TransformArray = [];
  for (let uuid in datasets) {
    if (datasets[uuid].setA === null || datasets[uuid].setB === null) { continue; }

    let rawMap_AtoB = TransformUtil.getRawMap_AtoB(datasets[uuid].setA, datasets[uuid].setB)
    let rawMap_BtoA = TransformUtil.getRawMap_AtoB(datasets[uuid].setB, datasets[uuid].setA)
    comparisonArray_AtoB = comparisonArray_AtoB.concat(rawMap_AtoB);
    comparisonArray_BtoA = comparisonArray_BtoA.concat(rawMap_BtoA);
  }

  comparisonArray_AtoB.sort((a,b) => { return b[0] - a[0]; });
  comparisonArray_BtoA.sort((a,b) => { return b[0] - a[0]; });
  let coreBuckets       = [ -50, -55, -60, -65, -70, -75, -80, -85, -90 ];

  let coreA = checkBucketFillFactor(coreBuckets, comparisonArray_AtoB);
  let coreB = checkBucketFillFactor(coreBuckets, comparisonArray_BtoA);

  return {userA: coreA, userB: coreB};
}

function checkBucketFillFactor(buckets:number[], data: TransformArray) : Record<string,number> {
  let bucketedData = TransformUtil.fillBuckets(buckets, data);

  // check if there are at least 4 buckets with at least 3 datapoints.
  let quality : Record<string, number> = {}
  for (let data of bucketedData) {
    quality[data.x] = data.data.length;
  }

  for (let bucket of buckets) {
    if (!quality[bucket]) {
      quality[bucket] = 0;
    }
  }
  return quality;
}
