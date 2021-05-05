import {User} from "../models/user.model";
import {Sphere} from "../models/sphere.model";
import {Hub} from "../models/hub.model";
import {StoneAbility} from "../models/stoneSubModels/stone-ability.model";
import {StoneAbilityProperty} from "../models/stoneSubModels/stone-ability-property.model";
import {StoneBehaviour} from "../models/stoneSubModels/stone-behaviour.model";
import {Scene} from "../models/scene.model";
import {Toon} from "../models/toon.model";
import {SphereFeature} from "../models/sphere-feature.model";
import {SphereTrackingNumber} from "../models/sphere-tracking-number.model";
import {DataObject} from "@loopback/repository/src/common-types";
import {Location} from "../models/location.model";
import {Message} from "../models/message.model";
import {Stone} from "../models/stone.model";
import {Entity} from "@loopback/repository";
import {SphereKey} from "../models/sphere-key.model";
import {StoneKey} from "../models/stoneSubModels/stone-key.model";

export interface SyncRequestResponse {
  user?: SyncResponseItemCore<User>,
  spheres: {
    [sphereId: string]: SyncRequestResponse_Sphere
  },
  firmwares?:   { status: SyncState, [hardwareVersion: string] : any },
  bootloaders?: { status: SyncState, [hardwareVersion: string] : any },
  keys?:        { },
}

export interface SyncRequestResponse_Sphere {
  data?: SyncResponseItemCore<Sphere>,
  hubs?: {
    [hubId: string]: {
      data: SyncResponseItemCore<Hub>,
    }
  },
  features?: {
    [featureId: string] : {
      data: SyncResponseItemCore<SphereFeature>
    }
  },
  locations?: {
    [locationId: string]: {
      data: SyncResponseItemCore<Location>,
    }
  },
  messages?:  {
    [messageId: string] : {
      data: SyncResponseItemCore<Message>
    }
  },
  scenes?:  {
    [sceneId: string] : {
      data: SyncResponseItemCore<Scene>
    }
  },
  stones?: {
    [stoneId: string]: SyncResponseStone,
  },
  trackingNumbers?: {
    [trackingNumberId: string] : {
      data: SyncResponseItemCore<SphereTrackingNumber>
    }
  }
  toons?:  {
    [toonId: string] : {
      data: SyncResponseItemCore<Toon>
    }
  },
  users?: SphereUsers
}

interface SyncResponseItemCore<T extends Entity> {
  status: SyncState,
  data?: DataObject<T>,
  error?: SyncError
}

export interface SyncResponseStone {
  data?: SyncResponseItemCore<Stone>,
  abilities?: {
    [abilityId:string]: {
      data: SyncResponseItemCore<StoneAbility>
      properties?: {
        [propertyId:string]: {
          data: SyncResponseItemCore<StoneAbilityProperty>
        }
      }
    }
  },
  behaviours?: {
    [behaviourId:string]: {
      data: SyncResponseItemCore<StoneBehaviour>
    }
  },
}


export type UserKeySet = UserKeys[]
export interface UserKeys {
  sphereId: string,
  sphereAuthorizationToken: string,
  sphereKeys: SphereKey[]
  stoneKeys: {[stoneId: string] : StoneKey[]}
}
