interface EventDataRequestOptions {
  userId?: string,
  userIds?: string[],
  sphereId?: string,
  locationId?: string,
  stoneId?: string,
  abilityId?: string,
}

interface EventFilter {
  type?:     "presence"  | "command" | "*" | "all",
  // stoneIds?  : { [key: string]: boolean }, // only get events from this Crownstone
  sphereIds? : { [key: string]: boolean }
}

type oauthScope = "all" | "user_location" | "stone_information" | "sphere_information" | "switch_stone" | "location_information" | "user_information" | "power_consumption" | "user_id";

interface ScopeFilter {
  [key: string]: {
    [key: string] : (arg0: any) => boolean
  }
}

interface AccessModel {
  accessToken: string,
  ttl: number,
  createdAt: Date,
  userId: string,
  spheres: {
    [key: string] : boolean
  },
  scopes: oauthScope[]
}

type SseEvent = SseSystemEvent | SseDataEvent
type SseSystemEvent = SystemEvent | PingEvent
type SseDataEvent = SwitchStateUpdateEvent     |
  MultiSwitchCrownstoneEvent      |
  SphereTokensUpdatedEvent        |
  PresenceSphereEvent             |
  PresenceLocationEvent           |
  DataChangeEvent                 |
  AbilityChangeEvent              |
  InvitationChangeEvent           |
  TransformEvents

interface PingEvent {
  type:    "ping",
  counter:  number,
}

type SystemSubType = "TOKEN_EXPIRED" | "NO_ACCESS_TOKEN" | "NO_CONNECTION" | "STREAM_START" | "STREAM_CLOSED" | "COULD_NOT_REFRESH_TOKEN"
interface SystemEvent {
  type:    "system",
  subType:  SystemSubType,
  code:     number,
  message:  string,
}

interface MultiSwitchCrownstoneEvent {
  type:        "command",
  subType:     "multiSwitch"
  sphere:      SphereData,
  switchData:  CrownstoneSwitchCommand[],
}

type TransformEvents = TransformEvent | TransformCollectionEvent | TransformCollectionPartialEvent | TransformCollectionFinishedEvent | TransformResultEvent | TransformStoppedEvent;

interface TransformEvent {
  type:      "transform",
  subType:   "sessionRequested" | "sessionReady",
  sphere:     SphereData
  sessionId:  string,
  userA:      UserData,
  userB:      UserData,
  phoneTypeA: string,
  phoneTypeB: string,
}

interface TransformCollectionEvent {
  type:        "transform",
  subType:     "collectionSessionReady",
  sphere:       SphereData
  sessionId:    string,
  collectionId: string,
}

interface TransformCollectionFinishedEvent {
  type:        "transform",
  subType:     "collectionCompleted",
  sphere:       SphereData
  sessionId:    string,
  collectionId: string,
  quality:      {userA: Record<string,number>, userB: Record<string,number>}
}

interface TransformCollectionPartialEvent {
  type:        "transform",
  subType:      "collectionPartiallyCompleted",
  sphere:       SphereData
  sessionId:    string,
  collectionId: string,
  user:         UserData,
  phoneType:    string,
}

interface TransformResultEvent {
  type:     "transform",
  subType:  "sessionCompleted",
  sphere:    SphereData
  sessionId: string,
  result:    TransformResult,
}
interface TransformStoppedEvent {
  type:     "transform",
  subType:  "sessionStopped",
  sphere:    SphereData
  sessionId: string,
}


interface PresenceSphereEvent {
  type:     "presence",
  subType:  "enterSphere" | "exitSphere"
  user:     UserData,
  sphere:   SphereData
}

interface PresenceLocationEvent {
  type:     "presence",
  subType:  "enterLocation" | "exitLocation"
  user:     UserData,
  sphere:   SphereData,
  location: LocationData,
}

interface DataChangeEvent {
  type:        "dataChange",
  subType:     "users"   | "spheres" | "stones" | "locations",
  operation:   "create"  | "delete"  | "update"
  sphere:      SphereData,
  changedItem: NameIdSet,
}

interface SphereTokensUpdatedEvent {
  type:        "sphereTokensChanged",
  subType:     "sphereAuthorizationTokens",
  operation:   "update"
  sphere:      SphereData,
}

interface AbilityChangeEvent {
  type:        "abilityChange",
  subType:     "dimming"   | "switchcraft" | "tapToToggle",
  sphere:      SphereData,
  stone:       CrownstoneData,
  ability:     AbilityData
}

interface InvitationChangeEvent {
  type:        "invitationChange",
  operation:   "invited" | "invitationRevoked"
  sphere:      SphereData,
  email:       string,
}
interface SwitchStateUpdateEvent {
  type:        'switchStateUpdate',
  subType:     'stone',
  sphere:       SphereData,
  crownstone:   CrownstoneSwitchState,
}

interface NameIdSet {
  id:   string,
  name: string
}
interface SphereData     extends NameIdSet {
  uid: number
}
interface UserData       extends NameIdSet {}
interface LocationData   extends NameIdSet {}
interface CrownstoneData extends NameIdSet {
  macAddress: string,
  uid: number,
}
interface CrownstoneSwitchState extends CrownstoneData {
  percentage: number, // 0 .. 100
}

interface CrownstoneSwitchCommand extends CrownstoneData {
  type: "TURN_ON" | "TURN_OFF" | "PERCENTAGE"
  percentage?: number, // 0 .. 100
}



interface AbilityData {
  type: "dimming"   | "switchcraft" | "tapToToggle",
  enabled: boolean,
  syncedToCrownstone: boolean,
}


type RoutingMap = {
  all: ArrayMap,
  presence: ArrayMap,
  command: ArrayMap,
}
type ArrayMap = { [key: string] : string[] }

interface EventDataResult {
  user?: UserEventData,
  users?: {[userId:string]: UserEventData},
  ability?: AbilityData,
  sphere?: SphereEventData,
  location?: LocationEventData,
  stone?: StoneEventData,
}
