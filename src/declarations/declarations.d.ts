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
      sphere?: {updatedAt: Date},
      hubs?: {
        [hubId: string]: {
          new?: boolean,
          hub: {updatedAt: Date}}
      },
      features?: {
        [featureId: string]: {
          new?: boolean,
          feature: { updatedAt: Date }}
      }
      locations?: {
        [locationId: string]: {
          new?: boolean,
          location: {updatedAt: Date},
          position?: {updatedAt: Date},
        }
      },
      messages?:  {
        [messageId: string]: {
          new?: boolean,
          message: {updatedAt: Date}}
      },
      scenes?: {
        [sceneId: string]: {
          new?: boolean,
          scene: {updatedAt: Date}}
      },
      stones?: {
        [stoneId: string]: {
          new?: boolean,
          stone: {updatedAt: Date},
          abilities?:  {
            [abilityId:string]: {
              new?: boolean,
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
              new?: boolean,
              behaviour: { updatedAt: Date }
            }
          }
        }
      },
      sortedLists?: {
        [sortedListId: string]: {
          new?: boolean,
          sortedList: { updatedAt: Date }}
      }
      trackingNumbers?: {
        [trackingNumberId: string]: {
          new?: boolean,
          trackingNumber: { updatedAt: Date }}
      }
      toons?: {
        [toonId: string]: {
          new?: boolean,
          toon: { updatedAt: Date }}
      }
    }
  }
}

type SyncType  = "FULL"    |  // will just get your spheres and user.
                 "REQUEST" |  // initial phase of sync
                   "REPLY";   // wrap up phase of sync where the user will give the cloud ...
                              //  ... any data that the cloud has requested with REQUEST_DATA (optional)

type SyncState = "DELETED" |  // this entity has been deleted
                 "IN_SYNC" |  // same updatedAt time
    "NEWER_DATA_AVAILABLE" |  // cloud has newer data (HAS DATA)
            "REQUEST_DATA" |  // you have newer data, please give to cloud.
                    "VIEW" |  // you have requested data, here it is. No syncing information
          "CREATED_IN_CLOUD"; // the cloud has an additional id other than what you requested