interface map       { [key: string]: boolean }
interface numberMap { [key: string]: number }
interface stringMap { [key: string]: string }
type uuid = string;
type crownstoneId = string;

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


interface idMap<T> {
  [id: string]: T
}

interface creationMap {
  [id: string]: string
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
type CrownstoneIdentifier = string; // maj_min as identifier representing the Crownstone.
type rssi = number;
type FingerprintDataPointObject = Record<CrownstoneIdentifier, rssi>


type SphereFeature_t = "ENERGY_COLLECTION_PERMISSION";

type EnergyInterval = '1m' | '5m' | '10m' | '15m' | '30m' | '1h' | '3h' | '6h' | '12h' | '1d' | '1w' | '1M' | 'fragment';
interface EnergyIntervalData {
  interpolationThreshold: number,
  isOnSamplePoint:        (timestamp: timestamp, timezone: timezone) => boolean,
  getPreviousSamplePoint: (timestamp: timestamp, timezone: timezone) => timestamp,
  getNthSamplePoint:      (fromSamplePoint: timestamp, n: number, timezone: timezone) => timestamp,
  getNumberOfSamplePointsBetween:  (fromSamplePoint: timestamp, toSamplePoint: timestamp, timezone: timezone) => timestamp,
  targetInterval:         EnergyInterval,
  basedOnInterval:        EnergyInterval,
}

