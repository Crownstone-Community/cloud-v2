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
    data?: DataObject<User>
  },
  spheres: {
    [sphereId: string]: SyncRequestReply_Sphere
  }
}

export interface SyncRequestReply_Sphere {
  sphere:    {
    status: SyncState,
    data?: DataObject<Sphere>
  },
  hubs?: {
    branchInSync: boolean,
    [hubId: string]: {
      hub: {
        status: SyncState,
        data?: DataObject<Hub>
      }
    } | boolean
  },
  features?: {
    branchInSync: boolean,
    [featureId: string] : {
      feature: {
        status: SyncState,
        data?: DataObject<SphereFeature>
      }
    } | boolean
  },
  locations?: {
    branchInSync: boolean,
    [locationId: string]: {
      branchInSync: boolean,
      location: {
        status: SyncState,
        data?: DataObject<Location>
      },
      position?: {
        status: SyncState,
        data?: DataObject<Position>
      },
    } | boolean
  },
  messages?:  {
    branchInSync: boolean,
    [messageId: string] : {
      message: {
        status: SyncState,
        data?: DataObject<Message>
      }
    } | boolean
  },
  scenes?:  {
    branchInSync: boolean,
    [sceneId: string] : {
      scene: {
        status: SyncState,
        data?: DataObject<Scene>
      }
    } | boolean
  },
  stones?: {
    branchInSync: boolean,
    [stoneId: string]: {
      branchInSync: boolean,
      stone: {
        status: SyncState,
        data?: DataObject<Stone>
      },
      abilities?: {
        branchInSync: boolean,
        [abilityId:string]: {
          ability: {
            status: SyncState,
            data?: DataObject<StoneAbility>
          }
          properties?: {
            branchInSync: boolean,
            [propertyId:string]:  {
              status: SyncState,
              data?: DataObject<StoneAbilityProperty>
            } | boolean
          }
        } | boolean
      },
      behaviours?: {
        branchInSync: boolean,
        [behaviourId:string]: {
          behaviour: {
            status: SyncState,
            data?: DataObject<StoneBehaviour>
          }
        } | boolean
      },
    } | boolean
  },
  sortedLists?: {
    branchInSync: boolean,
    [sortedListId: string] : {
      sortedList: {
        status: SyncState,
        data?: DataObject<SortedList>
      }
    } | boolean
  }
  trackingNumbers?: {
    branchInSync: boolean,
    [trackingNumberId: string] : {
      trackingNumber: {
        status: SyncState,
        data?: DataObject<SphereTrackingNumber>
      }
    } | boolean
  }
  toons?:  {
    branchInSync: boolean,
    [toonId: string] : {
      toon: {
        status: SyncState,
        data?: DataObject<Toon>
      }
    } | boolean
  },
}

