import {Sync_Locations} from "./Sync_Locations";
import {Sync_Scenes} from "./Sync_Scenes";
import {Sync_Features} from "./Sync_Features";
import {Sync_Toons} from "./Sync_Toons";
import {Sync_TrackingNumbers} from "./Sync_TrackingNumbers";
import {Sync_Hubs} from "./Sync_Hubs";
import {Sync_Stones} from "./Sync_Stones";


export class Sync_SphereComponents {

  locations:       Sync_Locations;
  features:        Sync_Features;
  scenes:          Sync_Scenes;
  toons:           Sync_Toons;
  trackingNumbers: Sync_TrackingNumbers;
  hubs:            Sync_Hubs;
  stones:          Sync_Stones;

  constructor(
    sphereId: string,
    accessRole: ACCESS_ROLE,
    creationMap: creationMap,
    requestSphere: any,
    replySphere: any
  ) {
    this.locations       = new Sync_Locations(      sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.features        = new Sync_Features(       sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.scenes          = new Sync_Scenes(         sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.toons           = new Sync_Toons(          sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.trackingNumbers = new Sync_TrackingNumbers(sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.hubs            = new Sync_Hubs(           sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.stones          = new Sync_Stones(         sphereId, accessRole, requestSphere, replySphere, creationMap);
  }
}