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
    lastTime: Date,
    full?: boolean
  },
  user: {updatedAt: Date},
  spheres: {
    [sphereId: string]: {
      sphere?:    {updatedAt: Date},
      hubs?: {
        [hubId: string]: { hub: {updatedAt: Date}}
      },
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
          behaviours?: {updatedAt: Date},
        }
      },
      toons?: {
        [toonId: string]: { toon: { updatedAt: Date }}
      }
      sortedLists?: {
        [sortedListId: string]: { sortedList: { updatedAt: Date }}
      }
      sphereFeatures?: {
        [sphereFeatureId: string]: { sphereFeature: { updatedAt: Date }}
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

type SyncState = "REQUEST_DATA" | "IN_SYNC" | "NEWER_DATA_AVAILABLE" | "DELETED";