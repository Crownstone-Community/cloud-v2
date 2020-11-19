interface map       { [key: string]: boolean }
interface numberMap { [key: string]: number }
interface stringMap { [key: string]: string }


type PromiseCallback = (any) => Promise<any>

type Credentials = {
  email: string;
  password: string;
};

type dbCategory = 'appInstallation' |
                  'crownstoneToken' |
                'devicePreferences' |
                           'device' |
                'fingerprintLinker' |
                      'fingerprint' |
                              'hub' |
                         'location' |
                          'message' |
                     'messageState' |
                      'messageUser' |
                            'scene' |
                       'sortedList' |
                     'sphereAccess' |
                    'sphereFeature' |
             'sphereTrackingNumber' |
                       'sphereKeys' |
                           'sphere' |
                            'stone' |
             'stoneAbilityProperty' |
                     'stoneAbility' |
                   'stoneBehaviour' |
                 'stoneSwitchState' |
                        'stoneKeys' |
                         'position' |
                             'toon' |
                             'user'

type SyncCategory = 'hubs'   |
                  'features' |
                 'abilities' |
                'behaviours' |
                  'messages' |
                'properties' |
                 'locations' |
                    'scenes' |
                    'stones' |
           'trackingNumbers' |
                     'toons'

interface SyncIgnoreList {
  hubs:            boolean,
  features:        boolean,
  abilities:       boolean,
  behaviours:      boolean,
  messages:        boolean,
  properties:      boolean,
  locations:       boolean,
  scenes:          boolean,
  stones:          boolean,
  trackingNumbers: boolean,
  toons:           boolean,
  user:            boolean,
  firmware:        boolean,
  bootloader:      boolean,
  keys:            boolean,
}

interface SyncRequest {
  sync: {
    appVersion?: string,
    type: SyncType,
    lastTime?: Date,
    scope?: SyncCategory[]
  },
  user?: UpdatedAt,
  spheres?: {
    [sphereId: string]: {
      data?: UpdatedAt,
      hubs?: {
        [hubId: string]: RequestItemCoreType
      },
      features?: {
        [featureId: string]: RequestItemCoreType
      }
      locations?: {
        [locationId: string]: RequestItemCoreType
      },
      messages?:  {
        [messageId: string]: RequestItemCoreType
      },
      scenes?: {
        [sceneId: string]: RequestItemCoreType
      },
      stones?: {
        [stoneId: string]: SyncRequestStoneData
      },
      trackingNumbers?: {
        [trackingNumberId: string]: RequestItemCoreType
      }
      toons?: {
        [toonId: string]: RequestItemCoreType
      }
    }
  }
}

interface SyncRequestStoneData {
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

type SyncState = "NOT_AVAILABLE" |  // this entity does not exist on the cloud or you dont have access to it.
                       "IN_SYNC" |  // same updatedAt time
                         "ERROR" |  // something went wrong (HAS ERROR)
            "NEW_DATA_AVAILABLE" |  // cloud has newer data (HAS DATA)
                  "REQUEST_DATA" |  // you have newer data, please give to cloud.
              "UPDATED_IN_CLOUD" |  // the cloud has been updated with your model
              "CREATED_IN_CLOUD" |  // the cloud has an additional id other than what you requested
                 "ACCESS_DENIED" |  // user has no permission to create/delete something.
                          "VIEW"    // you have requested data, here it is. No syncing information. (HAS DATA)


interface SyncError {
  code: number,
  msg: string
}

interface idMap<T> {
  [id: string]: T
}

interface nestedIdMap<T> {
  [id: string]: {
    [id: string] : T
  }
}

interface nestedIdArray<T> {
  [id: string]: T[]
}

type ACCESS_ROLE = 'admin' | 'member' | 'guest' | 'hub';

interface RolePermissions {
  admin?  : boolean,
  member? : boolean,
  guest?  : boolean,
  hub?    : boolean
}

