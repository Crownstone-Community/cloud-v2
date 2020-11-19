import {SSEPacketGenerator} from "./SSEPacketGenerator";
import {
  EventConstructor,
  EventLocationCache,
  EventSphereCache,
  EventStoneCache,
  EventUserCache
} from "./EventConstructor";
import {SSEManager} from "../SSEManager";
import {Sphere} from "../../../models/sphere.model";
import {Location} from "../../../models/location.model";
import {Stone} from "../../../models/stone.model";
import {StoneAbility} from "../../../models/stoneSubModels/stone-ability.model";


export class DataChangeEventHandler {
  // SPHERES //
  sendSphereCreatedEvent(sphere: SphereData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    let packet = SSEPacketGenerator.generateSphereCreatedEvent(sphere);
    SSEManager.emit(packet)
  }
  sendSphereUpdatedEventBySphereId(sphereId : string) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendSphereUpdatedEvent(data.sphere);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendSphereUpdatedEvent(sphere: SphereData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    let packet = SSEPacketGenerator.generateSphereUpdatedEvent(sphere);
    SSEManager.emit(packet)
  }
  sendSphereDeletedEvent(sphere: SphereData) {
    let packet = SSEPacketGenerator.generateSphereDeletedEvent(sphere);
    SSEManager.emit(packet)
  }

  // USERS //

  // ----- USERS CREATE ----- //
  sendSphereUserCreatedEventById(sphereId: string, userId: string) {
    return EventConstructor.getData({userId, sphereId})
      .then((data) => {
        this.sendSphereUserCreatedEvent(data.sphere, data.user);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendSphereUserCreatedEvent(sphere: SphereData, user: UserData) {
    let packet = SSEPacketGenerator.generateSphereUserAddedEvent(sphere, user);
    SSEManager.emit(packet)
  }

  // ----- USERS INVITED ----- //
  sendSphereUserInvitedEventById(sphereId: string, email: string) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendSphereUserInvitedEvent(data.sphere,email);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendSphereUserInvitedEvent(sphere: SphereData, email: string) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    let packet = SSEPacketGenerator.generateSphereUserInvitedEvent(sphere, email);
    SSEManager.emit(packet)
  }

  // ----- USERS INVITE REVOKED ----- //
  sendSphereUserInvitationRevokedEventById(sphereId: string, email: string) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendSphereUserInvitationRevokedEvent(data.sphere, email);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendSphereUserInvitationRevokedEvent(sphere: SphereData, email:string) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    let packet = SSEPacketGenerator.generateSphereUserInvitationRevokedEvent(sphere, email);
    SSEManager.emit(packet)
  }


  // ----- USERS UPDATE ----- //
  sendSphereUserUpdatedEventById(sphereId: string, userId: string) {
    return EventConstructor.getData({userId, sphereId})
      .then((data) => {
        this.sendSphereUserUpdatedEvent(data.sphere, data.user);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendSphereUserUpdatedEvent(sphere: SphereData, user: UserData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventUserCache.load(user.id, user as any);
    let packet = SSEPacketGenerator.generateSphereUserUpdatedEvent(sphere, user);
    SSEManager.emit(packet)
  }

  // ----- USERS DELETE ----- //
  sendSphereUserDeletedEvent(sphere: SphereData, user: UserData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventUserCache.remove(user.id);
    let packet = SSEPacketGenerator.generateSphereUserDeletedEvent(sphere, user);
    SSEManager.emit(packet)
  }

  sendSphereTokensUpdatedById(sphereId: string) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendSphereTokensUpdated(data.sphere);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendSphereTokensUpdated(sphere: SphereData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    let packet = SSEPacketGenerator.generateSphereTokensUpdatedEvent(sphere);
    SSEManager.emit(packet)
  }



  // STONES //
  // ----- STONES CREATE ----- //
  sendStoneCreatedEventBySphereId(sphereId: string, stone: Stone) {
    EventStoneCache.load(stone.id, stone as any);
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneCreatedEvent(data.sphere, stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendStoneCreatedEvent(sphere: SphereData, stone: Stone) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventStoneCache.load(stone.id, stone as any);
    let packet = SSEPacketGenerator.generateStoneCreatedEvent(sphere, stone);
    SSEManager.emit(packet)
  }

  // ----- STONES UPDATE ----- //
  sendStoneSwitchOccurredBySphereId(sphereId: string, stone: CrownstoneData, percentage: number) {
    EventStoneCache.load(stone.id, stone as any);
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneSwitchOccurredEvent(data.sphere, stone, percentage);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendStoneSwitchOccurredEvent(sphere: SphereData, stone: CrownstoneData, percentage: number) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventStoneCache.load(stone.id, stone as any);
    let packet = SSEPacketGenerator.generateSwitchStateUpdatedEvent(sphere, stone, percentage);
    SSEManager.emit(packet)
  }

  sendStoneUpdatedEventByIds(sphereId: string, stoneId: string) {
    return EventConstructor.getData({sphereId, stoneId})
      .then((data) => {
        this.sendStoneUpdatedEvent(data.sphere, data.stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendStoneUpdatedEventBySphereId(sphereId: string, stone: CrownstoneData) {
    EventStoneCache.load(stone.id, stone as any);
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneUpdatedEvent(data.sphere, stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendStoneUpdatedEvent(sphere: SphereData, stone: CrownstoneData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventStoneCache.load(stone.id, stone as any);
    let packet = SSEPacketGenerator.generateStoneUpdatedEvent(sphere, stone);
    SSEManager.emit(packet)
  }

  // ----- STONES DELETE ----- //
  sendStoneDeletedEventBySphereId(sphereId: string, stone: CrownstoneData) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneDeletedEvent(data.sphere, stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendStoneDeletedEvent(sphere: SphereData, stone: CrownstoneData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventStoneCache.remove(stone.id);
    let packet = SSEPacketGenerator.generateStoneDeletedEvent(sphere, stone);
    SSEManager.emit(packet)
  }


  // ----------- ABILITY CHANGE ------------- //
  sendAbilityChangeEventByIds(sphereId: string, stoneId: string, abilityId: string) {
    return EventConstructor.getData({sphereId, stoneId, abilityId})
      .then((data) => {
        let packet = SSEPacketGenerator.generateAbilityChangeEvent(data.sphere, data.stone, data.ability);
        SSEManager.emit(packet)
      })
      .catch((err) => { console.log(err)/** ignore error, simply do not generate event. **/ })
  }
  sendAbilityChangeEventByParentIds(sphereId: string, stoneId: string, ability: StoneAbility) {
    return EventConstructor.getData({sphereId, stoneId})
      .then((data) => {
        let packet = SSEPacketGenerator.generateAbilityChangeEvent(data.sphere, data.stone, ability);
        SSEManager.emit(packet)
      })
      .catch((err) => { console.log(err)/** ignore error, simply do not generate event. **/ })
  }



  // LOCATIONS //
  // ----- LOCATIONS CREATE ----- //
  sendLocationCreatedEventBySphereId(sphereId: string, location: LocationData) {
    EventLocationCache.load(location.id, location as Location);
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendLocationCreatedEvent(data.sphere, location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendLocationCreatedEvent(sphere: SphereData, location: LocationData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventLocationCache.load(location.id, location as Location);
    let packet = SSEPacketGenerator.generateLocationCreatedEvent(sphere, location);
    SSEManager.emit(packet)
  }

  // ----- LOCATIONS UPDATE ----- //
  sendLocationUpdatedEventByIds(sphereId: string, locationId: string) {
    return EventConstructor.getData({sphereId, locationId})
      .then((data) => {
        this.sendLocationUpdatedEvent(data.sphere, data.location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendLocationUpdatedEventBySphereId(sphereId: string, location: LocationData) {
    EventLocationCache.load(location.id, location as Location);
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendLocationUpdatedEvent(data.sphere, location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendLocationUpdatedEvent(sphere: SphereData, location: LocationData) {
    EventSphereCache.load(sphere.id, sphere as Sphere);
    EventLocationCache.load(location.id, location as Location);
    let packet = SSEPacketGenerator.generateLocationUpdatedEvent(sphere, location);
    SSEManager.emit(packet)
  }

  // ----- LOCATIONS DELETE ----- //
  sendLocationDeletedEventBySphereId(sphereId: string, location: LocationData) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendLocationDeletedEvent(data.sphere, location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendLocationDeletedEvent(sphere: SphereData, location: LocationData) {
    EventLocationCache.remove(location.id);
    let packet = SSEPacketGenerator.generateLocationDeletedEvent(sphere, location);
    SSEManager.emit(packet)
  }
}

