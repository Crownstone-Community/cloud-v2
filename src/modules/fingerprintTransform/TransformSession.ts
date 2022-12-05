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
  phoneType_A: string;
  phoneType_B: string;

  invitePending: boolean = false;

  datasets: {[uuid:string] : {setA: MeasurementMap, setB: MeasurementMap}} = {};

  inviteInterval : NodeJS.Timeout;
  inviteTimeout  : NodeJS.Timeout;

  constructor(id: uuid, sphereId: string, destructor: () => void, userId_A: string, phoneType_A: string, userId_B: string, phoneType_B: string) {
    this.id = id;
    this.sphereId = sphereId;
    this.destructor = destructor;

    this.cleanupTimeout = setTimeout(() => {
      this.cleanup();
    }, 30*60*1000); // 30 minutes

    this.userId_A = userId_A;
    this.userId_B = userId_B;
    this.phoneType_A = phoneType_A;
    this.phoneType_B = phoneType_B;
  }

  async init() : Promise<void> {
    try {
      this.userA = await Dbs.user.findById(this.userId_A);
      this.userB = await Dbs.user.findById(this.userId_B);
      this.sphere = await Dbs.sphere.findById(this.sphereId);

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
          this.phoneType_A,
          this.phoneType_B
        );
      }, 2000);

      this.inviteTimeout = setTimeout(() => {
        this._stopInviting();
      }, 600 * 1000); // 1 minute
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
        this.phoneType_A,
        this.phoneType_B
      );
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

  finishedCollectingDataset(userId: string, datasetUUID: uuid, dataset: MeasurementMap) {
    if (this.datasets[datasetUUID] === undefined) { throw new Error("Dataset not found"); }

    if (userId === this.userId_A && this.datasets[datasetUUID].setA === null) {
      this.datasets[datasetUUID].setA = dataset;
      EventHandler.transform.sendTransformDatacollectionReceivedEvent(
        this.sphere,
        this.id,
        datasetUUID,
        this.userA,
        this.phoneType_A
      );
    }
    else if (userId === this.userId_A && this.datasets[datasetUUID].setA !== null) {
      throw new Error("Already received dataset from user A for this collection session.");
    }
    else if (userId === this.userId_B && this.datasets[datasetUUID].setB === null) {
      this.datasets[datasetUUID].setB = dataset;
      EventHandler.transform.sendTransformDatacollectionReceivedEvent(
        this.sphere,
        this.id,
        datasetUUID,
        this.userB,
        this.phoneType_B
      );
    }
    else if (userId === this.userId_B && this.datasets[datasetUUID].setB !== null) {
      throw new Error("Already received dataset from user B for this collection session.");
    }

    if (this.datasets[datasetUUID].setA !== null && this.datasets[datasetUUID].setB !== null) {
      EventHandler.transform.sendTransformDatacollectionFinishedEvent(
        this.sphere,
        this.id,
        datasetUUID,
      );
    }
  }

  generateTransformSets() : TransformResult {
    let aToB = this._generateTransformSetDirection(true);
    let bToA = this._generateTransformSetDirection(false);
    let result = [
      {sessionId: this.id, fromDevice: this.phoneType_A, toDevice: this.phoneType_B, transform: aToB},
      {sessionId: this.id, fromDevice: this.phoneType_B, toDevice: this.phoneType_A, transform: bToA}
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
    let comparisonArray : TransformArray = [];
    for (let i = 0; i < sets_From.length; i++) {
      let rawMap = TransformUtil.getRawMap_AtoB(sets_From[i], sets_To[i])
      comparisonArray = comparisonArray.concat(rawMap);
    }
    let normalizedMap = TransformUtil.getNormalizedMap(comparisonArray);
    normalizedMap.sort((a,b) => { return b[0] - a[0]; });


    let buckets            = TransformUtil.getBuckets();
    let bucketedData       = TransformUtil.fillBuckets(buckets, normalizedMap);
    let bucketedAverages   = TransformUtil.getAveragedBucketMap(bucketedData);
    let interpolatedValues = TransformUtil.getInterpolatedValues(bucketedAverages);

    let transformSet = [...bucketedAverages, ...interpolatedValues].filter((item) => { return item.data[0] !== null });
    transformSet.sort((a,b) => { return b.x - a.x });

    return transformSet;
  }


}