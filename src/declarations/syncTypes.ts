import {User} from "../models/user.model";
import {Sphere} from "../models/sphere.model";
import {Hub} from "../models/hub.model";
import {StoneAbility} from "../models/stoneSubModels/stone-ability.model";
import {StoneAbilityProperty} from "../models/stoneSubModels/stone-ability-property.model";
import {StoneBehaviour} from "../models/stoneSubModels/stone-behaviour.model";

export interface SyncRequestReply {
  user: {
    status: SyncState,
    data?: User
  },
  spheres: {
    [sphereId: string]: {
      sphere:    {
        status: SyncState,
        data?: Sphere
      },
      hubs: {
        branchInSync: boolean,
        [hubId: string]: {
          hub: {
            status: SyncState,
            data?: Hub
          }
        } | boolean
      },
      locations?: {
        branchInSync: boolean,
        [locationId: string]: {
          branchInSync: boolean,
          location: {
            status: SyncState,
            data?: Hub
          },
          position: {
            status: SyncState,
            data?: Hub
          },
        } | boolean
      },
      messages?:  {
        branchInSync: boolean,
        [messageId: string] : {
          message: {
            status: SyncState,
            data?: Hub
          }
        } | boolean
      },
      stones?: {
        branchInSync: boolean,
        [stoneId: string]: {
          branchInSync: boolean,
          stone: {
            status: SyncState,
            data?: Hub
          },
          abilities?: {
            [abilityId:string]: {
              ability: {
                status: SyncState,
                data?: StoneAbility
              }
              properties?: {
                [propertyId:string]:  {
                  status: SyncState,
                  data?: StoneAbilityProperty
                }
              }
            }
          },
          behaviours?: {
            status: SyncState,
            data?: StoneBehaviour
          },
        } | boolean
      }
    }
  }
}