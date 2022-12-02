import {Stone} from "../../../models/stone.model";
import {StoneAbility} from "../../../models/stoneSubModels/stone-ability.model";

export const SSEPacketGenerator = {

  generateLocalizationTransformRequest(deviceId: string, uuid: string) {

  },

  generateLocalizationTransformStart(uuid: string) {

  },

  generateLocalizationTransformDeviceComplete(deviceId: string, uuid: string) {

  },

  generateLocalizationTransformComplete(uuid: string) {

  },

  // generateMultiSwitchCrownstoneEvent(sphere: SphereData, stone: CrownstoneData[], switchStateMap) {
  //   let stoneData = [];
  //   for (let i = 0; i < stones.length; i++) {
  //     let csData = crownstoneSwitchCommand(
  //       stones[i],
  //       switchStateMap[stones[i].id].type,
  //       switchStateMap[stones[i].id].percentage
  //     );
  //     stoneData.push(csData);
  //   }
  //
  //   return {
  //     type:        "command",
  //     subType:     "multiSwitch",
  //     sphere:      sphereData(sphere),
  //     switchData:  stoneData
  //   };
  // },

  generateSwitchStateUpdatedEvent(sphere: SphereData, stone: CrownstoneData, percentage: number) : SseDataEvent {
    return {
      type:       "switchStateUpdate",
      subType:    "stone",
      sphere:     sphereData(sphere),
      crownstone: crownstoneSwitchState(stone, percentage)
    };
  },

  generateEnterSphereEvent(user: UserData, sphere: SphereData) : SseDataEvent {
    return {
      type:     "presence",
      subType:  "enterSphere",
      sphere:   sphereData(sphere),
      user:     userData(user),
    };
  },

  generateExitSphereEvent(user: UserData, sphere: SphereData) : SseDataEvent {
    return {
      type:     "presence",
      subType:  "exitSphere",
      sphere:   sphereData(sphere),
      user:     userData(user),
    };
  },

  generateEnterLocationEvent(user: UserData, sphere: SphereData, location: LocationData) : SseDataEvent {
    return {
      type:     "presence",
      subType:  "enterLocation",
      sphere:   sphereData(sphere),
      location: locationData(location),
      user:     userData(user),
    };
  },

  generateExitLocationEvent(user: UserData, sphere: SphereData, location: LocationData) : SseDataEvent {
    return {
      type:     "presence",
      subType:  "exitLocation",
      sphere:   sphereData(sphere),
      location: locationData(location),
      user:     userData(user),
    };
  },


  // SPHERES //
  generateSphereCreatedEvent(sphere: SphereData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "spheres",
      operation:   "create",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(sphere),
    };
  },
  generateSphereUpdatedEvent(sphere: SphereData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "spheres",
      operation:   "update",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(sphere),
    };
  },
  generateSphereDeletedEvent(sphere: SphereData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "spheres",
      operation:   "delete",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(sphere),
    };
  },

  // USERS //
  generateSphereUserAddedEvent(sphere: SphereData, user: UserData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "users",
      operation:   "create",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(user),
    };
  },
  generateSphereUserInvitedEvent(sphere: SphereData, email: string) : SseDataEvent {
    return {
      type:        "invitationChange",
      operation:   "invited",
      sphere:      sphereData(sphere),
      email:       email,
    };
  },
  generateSphereUserInvitationRevokedEvent(sphere: SphereData, email: string) : SseDataEvent {
    return {
      type:        "invitationChange",
      operation:   "invitationRevoked",
      sphere:      sphereData(sphere),
      email:       email,
    };
  },
  generateSphereUserUpdatedEvent(sphere: SphereData, user: UserData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "users",
      operation:   "update",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(user),
    };
  },
  generateSphereUserDeletedEvent(sphere: SphereData, user: UserData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "users",
      operation:   "delete",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(user),
    };
  },
  generateSphereTokensUpdatedEvent(sphere: SphereData) : SseDataEvent {
    return {
      type:        "sphereTokensChanged",
      subType:     "sphereAuthorizationTokens",
      operation:   "update",
      sphere:      sphereData(sphere),
    };
  },

  // STONES //
  generateStoneCreatedEvent(sphere: SphereData, stone: Stone) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "stones",
      operation:   "create",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(stone),
    };
  },
  generateStoneUpdatedEvent(sphere: SphereData, stone: CrownstoneData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "stones",
      operation:   "update",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(stone),
    };
  },
  generateStoneDeletedEvent(sphere: SphereData, stone: CrownstoneData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "stones",
      operation:   "delete",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(stone),
    };
  },

  generateAbilityChangeEvent(sphere: SphereData, stone: CrownstoneData, ability: AbilityData | StoneAbility) : SseDataEvent {
    return {
      type:        "abilityChange",
      subType:     ability.type as any,
      sphere:      sphereData(sphere),
      stone:       crownstoneData(stone),
      ability:     abilityData(ability)
    };
  },

  // Locations //
  generateLocationCreatedEvent(sphere: SphereData, location : LocationData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "locations",
      operation:   "create",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(location),
    };
  },
  generateLocationUpdatedEvent(sphere: SphereData, location : LocationData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "locations",
      operation:   "update",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(location),
    };
  },
  generateLocationDeletedEvent(sphere: SphereData, location : LocationData) : SseDataEvent {
    return {
      type:        "dataChange",
      subType:     "locations",
      operation:   "delete",
      sphere:      sphereData(sphere),
      changedItem: nameIdSet(location),
    };
  },
};


function sphereData( sphere: SphereData )       { return { id: String(sphere.id), name: sphere.name, uid: sphere.uid }; }
function locationData( location: LocationData ) { return nameIdSet(location); }
function userData( user: UserData )             { return nameIdSet(user); }
function nameIdSet( item : any )                { return { id: String(item.id), name: item.name}; }
function abilityData( ability: StoneAbility | AbilityData ): AbilityData { return { type: ability.type as any, enabled: ability.enabled, syncedToCrownstone: ability.syncedToCrownstone }; }

function crownstoneData( stone: CrownstoneData )  {
  return { id: String(stone.id),  uid: stone.uid,  name: stone.name, macAddress: stone.macAddress };
}

function crownstoneSwitchState( stone: CrownstoneData, percentage: number )  {
  return { id: String(stone.id),  uid: stone.uid,  name: stone.name, macAddress: stone.macAddress, percentage: percentage, switchState: percentage };
}


function crownstoneSwitchCommand( stone: CrownstoneData, type: "PERCENTAGE" | "TURN_ON" | "TURN_OFF", percentage: number ) : any {
  let base = {
    id: String(stone.id),
    uid: stone.uid,
    name: stone.name,
    macAddress: stone.macAddress,
    type: type,
  };
  if (type === "PERCENTAGE") {
    // @ts-ignore
    base.percentage = percentage;
  }
  return base;
}
