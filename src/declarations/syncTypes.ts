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
import {Entity} from "@loopback/repository";

export interface SyncRequestReply {
  user?: SyncReplyItemCore<User>,
  spheres: {
    [sphereId: string]: SyncRequestReply_Sphere
  },
  firmwares?:   { },
  bootloaders?: { },
  keys?:        { },
}

export interface SyncRequestReply_Sphere {
  sphere?: SyncReplyItemCore<Sphere>,
  hubs?: {
    [hubId: string]: {
      data: SyncReplyItemCore<Hub>,
    }
  },
  features?: {
    [featureId: string] : {
      data: SyncReplyItemCore<SphereFeature>
    }
  },
  locations?: {
    [locationId: string]: {
      data: SyncReplyItemCore<Location>,
      position?: SyncReplyItemCore<Position>,
    }
  },
  messages?:  {
    [messageId: string] : {
      data: SyncReplyItemCore<Message>
    }
  },
  scenes?:  {
    [sceneId: string] : {
      data: SyncReplyItemCore<Scene>
    }
  },
  stones?: {
    [stoneId: string]: {
      data: SyncReplyItemCore<Stone>,
      abilities?: {
        [abilityId:string]: {
          data: SyncReplyItemCore<StoneAbility>
          properties?: {
            [propertyId:string]: SyncReplyItemCore<StoneAbilityProperty>
          }
        }
      },
      behaviours?: {
        [behaviourId:string]: {
          data: SyncReplyItemCore<StoneBehaviour>
        }
      },
    }
  },
  sortedLists?: {
    [sortedListId: string] : {
      data: SyncReplyItemCore<SortedList>
    }
  }
  trackingNumbers?: {
    [trackingNumberId: string] : {
      data: SyncReplyItemCore<SphereTrackingNumber>
    }
  }
  toons?:  {
    [toonId: string] : {
      data: SyncReplyItemCore<Toon>
    }
  },
}

interface SyncReplyItemCore<T extends Entity> {
  status: SyncState,
  data?: DataObject<T>,
  error?: SyncError
}

interface SyncError {
  code: number,
  msg: string
}