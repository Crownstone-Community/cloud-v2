interface map       { [key: string]: boolean }
interface numberMap { [key: string]: number }
interface stringMap { [key: string]: string }


type PromiseCallback = (any) => Promise<any>

type Credentials = {
  email: string;
  password: string;
};

type SyncCategories = 'hubs' |
                  'features' |
                    'scenes' |
               'sortedLists' |
           'trackingNumbers' |
                     'toons'

interface SyncRequest {
  sync: {
    type: SyncType,
    lastTime: Date,
  },
  user: UpdatedAt,
  spheres: {
    [sphereId: string]: {
      data?: UpdatedAt,
      hubs?: {
        [hubId: string]: RequestItemCoreType
      },
      features?: {
        [featureId: string]: RequestItemCoreType
      }
      locations?: {
        [locationId: string]: {
          new?: boolean,
          data:  UpdatedAt,
          position?: UpdatedAt,
        }
      },
      messages?:  {
        [messageId: string]: RequestItemCoreType
      },
      scenes?: {
        [sceneId: string]: RequestItemCoreType
      },
      stones?: {
        [stoneId: string]: {
          new?: boolean,
          data: UpdatedAt,
          abilities?:  {
            [abilityId:string]: {
              new?: boolean,
              data: UpdatedAt
              properties?: {
                [propertyId:string]: RequestItemCoreType
              }
            }
          },
          behaviours?: {
            [behaviourId: string]: RequestItemCoreType
          }
        }
      },
      sortedLists?: {
        [sortedListId: string]: RequestItemCoreType
      }
      trackingNumbers?: {
        [trackingNumberId: string]: RequestItemCoreType
      }
      toons?: {
        [toonId: string]: RequestItemCoreType
      }
    }
  }
}

interface RequestItemCoreType {
  new?: boolean,
  data: UpdatedAt
}
interface UpdatedAt {
  updatedAt: Date
}

type SyncType  = "FULL"    |  // will just get your spheres and user.
                 "REQUEST" |  // initial phase of sync
                 "REPLY";     // wrap up phase of sync where the user will give the cloud ...
                              //  ... any data that the cloud has requested with REQUEST_DATA (optional)

type SyncState = "DELETED" |  // this entity has been deleted
                 "IN_SYNC" |  // same updatedAt time
                   "ERROR" |  // something went wrong (HAS ERROR)
      "NEW_DATA_AVAILABLE" |  // cloud has newer data (HAS DATA)
            "REQUEST_DATA" |  // you have newer data, please give to cloud.
        "CREATED_IN_CLOUD" |  // the cloud has an additional id other than what you requested
                    "VIEW"    // you have requested data, here it is. No syncing information. (HAS DATA)
