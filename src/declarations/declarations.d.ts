interface map       { [key: string]: boolean }
interface numberMap { [key: string]: number }
interface stringMap { [key: string]: string }


type PromiseCallback = (any) => Promise<any>

type Credentials = {
  email: string;
  password: string;
};

interface SyncRequest {
  sync: {
    type: SyncPhase,
    lastTime: Date,
  },
  user: {updatedAt: Date},
  spheres: {
    [sphereId: string]: {
      sphere?:    {updatedAt: Date},
      hubs?: {
        [hubId: string]: { hub: {updatedAt: Date}}
      },
      features?: {
        [featureId: string]: { feature: { updatedAt: Date }}
      }
      locations?: {
        [locationId: string]: {
          location: {updatedAt: Date},
          position?: {updatedAt: Date},
        }
      },
      messages?:  {
        [messageId: string]: { message: {updatedAt: Date}}
      },
      scenes?: {
        [sceneId: string]: { scene: {updatedAt: Date}}
      },
      stones?: {
        [stoneId: string]: {
          stone: {updatedAt: Date},
          abilities?:  {
            [abilityId:string]: {
              ability:    {updatedAt: Date},
              properties?: {
                [propertyId:string]: {
                  property: {updatedAt: Date}
                }
              }
            }
          },
          behaviours?: {
            [behaviourId: string]: {
              behaviour: { updatedAt: Date }
            }
          }
        }
      },
      sortedLists?: {
        [sortedListId: string]: { sortedList: { updatedAt: Date }}
      }
      trackingNumbers?: {
        [trackingNumberId: string]: { trackingNumber: { updatedAt: Date }}
      }
      toons?: {
        [toonId: string]: { toon: { updatedAt: Date }}
      }
    }
  }
}

type SyncType  = "FULL"    | "REQUEST" | "REPLY";
type SyncState = "DELETED" | "IN_SYNC" | "NEWER_DATA_AVAILABLE" | "REQUEST_DATA" | "VIEW" | "CREATED_IN_CLOUD";

interface SyncSimpleItem {
  branchInSync: boolean,
  [id: string] : {
    [item: string]: {
      status: SyncState,
      data?: any
    }
  } | boolean
}