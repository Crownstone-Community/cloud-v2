import {Sync_Locations} from "./Sync_Locations";
import {Sync_Scenes} from "./Sync_Scenes";
import {Sync_Features} from "./Sync_Features";
import {Sync_Toons} from "./Sync_Toons";
import {Sync_Hubs} from "./Sync_Hubs";
import {Sync_Stones} from "./Sync_Stones";
import {Sync_SphereUsers} from "./Sync_SphereUsers";
import {Sync_Messages} from "./Sync_Messages";
import {Sync_Fingerprints} from "./Sync_Fingerprints";


export class Sync_SphereComponents {

  locations:       Sync_Locations;
  features:        Sync_Features;
  fingerprints:    Sync_Fingerprints;
  messages:        Sync_Messages;
  scenes:          Sync_Scenes;
  toons:           Sync_Toons;
  hubs:            Sync_Hubs;
  stones:          Sync_Stones;
  users:           Sync_SphereUsers;

  constructor(
    sphereId: string,
    accessRole: ACCESS_ROLE,
    creationMap: creationMap,
    requestSphere: any,
    replySphere: any
  ) {
    this.features        = new Sync_Features(    sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.fingerprints    = new Sync_Fingerprints(sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.hubs            = new Sync_Hubs(        sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.locations       = new Sync_Locations(   sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.messages        = new Sync_Messages(    sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.scenes          = new Sync_Scenes(      sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.stones          = new Sync_Stones(      sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.users           = new Sync_SphereUsers( sphereId, accessRole, requestSphere, replySphere, creationMap);
    this.toons           = new Sync_Toons(       sphereId, accessRole, requestSphere, replySphere, creationMap);
  }
}
