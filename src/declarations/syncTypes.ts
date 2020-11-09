import {User} from "../models/user.model";
import {Sphere} from "../models/sphere.model";
import {Hub} from "../models/hub.model";
import {StoneAbility} from "../models/stoneSubModels/stone-ability.model";
import {StoneAbilityProperty} from "../models/stoneSubModels/stone-ability-property.model";
import {StoneBehaviour} from "../models/stoneSubModels/stone-behaviour.model";
import {Scene} from "../models/scene.model";
import {Toon} from "../models/toon.model";
import {SortedList} from "../models/sorted-list.model";
import {SphereFeature} from "../models/sphere-feature.model";
import {SphereTrackingNumber} from "../models/sphere-tracking-number.model";
import {DataObject} from "@loopback/repository/src/common-types";
import {Position} from "../models/position.model";
import {Location} from "../models/location.model";
import {Message} from "../models/message.model";
import {Stone} from "../models/stone.model";

export interface SyncRequestReply {
  user: {
    status: SyncState,
    data?:  DataObject<User>
  },
  spheres: {
    [sphereId: string]: SyncRequestReply_Sphere
  },
  firmwares?:   { },
  bootloaders?: { },
  keys?:        { },
}

export interface SyncRequestReply_Sphere {
  sphere:    {
    status: SyncState,
    data?: DataObject<Sphere>
  },
  hubs?: {
    [hubId: string]: {
      hub: {
        status: SyncState,
        data?: DataObject<Hub>
      }
    }
  },
  features?: {
    [featureId: string] : {
      feature: {
        status: SyncState,
        data?: DataObject<SphereFeature>
      }
    }
  },
  locations?: {
    [locationId: string]: {
      location: {
        status: SyncState,
        data?: DataObject<Location>
      },
      position?: {
        status: SyncState,
        data?: DataObject<Position>
      },
    }
  },
  messages?:  {
    [messageId: string] : {
      message: {
        status: SyncState,
        data?: DataObject<Message>
      }
    }
  },
  scenes?:  {
    [sceneId: string] : {
      scene: {
        status: SyncState,
        data?: DataObject<Scene>
      }
    }
  },
  stones?: {
    [stoneId: string]: {
      stone: {
        status: SyncState,
        data?: DataObject<Stone>
      },
      abilities?: {
        [abilityId:string]: {
          ability: {
            status: SyncState,
            data?: DataObject<StoneAbility>
          }
          properties?: {
            [propertyId:string]:  {
              status: SyncState,
              data?: DataObject<StoneAbilityProperty>
            }
          }
        }
      },
      behaviours?: {
        [behaviourId:string]: {
          behaviour: {
            status: SyncState,
            data?: DataObject<StoneBehaviour>
          }
        }
      },
    }
  },
  sortedLists?: {
    [sortedListId: string] : {
      sortedList: {
        status: SyncState,
        data?: DataObject<SortedList>
      }
    }
  }
  trackingNumbers?: {
    [trackingNumberId: string] : {
      trackingNumber: {
        status: SyncState,
        data?: DataObject<SphereTrackingNumber>
      }
    }
  }
  toons?:  {
    [toonId: string] : {
      toon: {
        status: SyncState,
        data?: DataObject<Toon>
      }
    }
  },
}

