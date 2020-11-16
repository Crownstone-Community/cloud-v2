import {SSEPacketGenerator} from "./SSEPacketGenerator";
import {EventConstructor} from "./EventConstructor";
import {SSEManager} from "../SSEManager";


export class DataChangeEventHandler {
  // SPHERES //
  sendSphereCreatedEvent(sphere: SphereData) {
    let packet = SSEPacketGenerator.generateSphereCreatedEvent(sphere);
    SSEManager.emit(packet)
  }
  sendSphereUpdatedEvent(sphere: SphereData) {
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
    let packet = SSEPacketGenerator.generateSphereUserUpdatedEvent(sphere, user);
    SSEManager.emit(packet)
  }

  // ----- USERS DELETE ----- //
  sendSphereUserDeletedEvent(sphere: SphereData, user: UserData) {
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
    let packet = SSEPacketGenerator.generateSphereTokensUpdatedEvent(sphere);
    SSEManager.emit(packet)
  }



  // STONES //
  // ----- STONES CREATE ----- //
  sendStoneCreatedEventBySphereId(sphereId: string, stone: CrownstoneData) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneCreatedEvent(data.sphere, stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendStoneCreatedEvent(sphere: SphereData, stone: CrownstoneData) {
    let packet = SSEPacketGenerator.generateStoneCreatedEvent(sphere, stone);
    SSEManager.emit(packet)
  }

  // ----- STONES UPDATE ----- //
  sendStoneSwitchOccurredBySphereId(sphereId: string, stone: CrownstoneData, percentage: number) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneSwitchOccurredEvent(data.sphere, stone, percentage);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendStoneSwitchOccurredEvent(sphere: SphereData, stone: CrownstoneData, percentage: number) {
    let packet = SSEPacketGenerator.generateSwitchStateUpdatedEvent(sphere, stone, percentage);
    SSEManager.emit(packet)
  }

  sendStoneUpdatedEventBySphereId(sphereId: string, stone: CrownstoneData) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendStoneUpdatedEvent(data.sphere, stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendStoneUpdatedEvent(sphere: SphereData, stone: CrownstoneData) {
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
    let packet = SSEPacketGenerator.generateStoneDeletedEvent(sphere, stone);
    SSEManager.emit(packet)
  }


  // ----------- ABILITY CHANGE ------------- //
  sendAbilityChangeEventByIds(sphereId: string, stoneId: string, ability: AbilityData) {
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
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendLocationCreatedEvent(data.sphere, location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendLocationCreatedEvent(sphere: SphereData, location: LocationData) {
    let packet = SSEPacketGenerator.generateLocationCreatedEvent(sphere, location);
    SSEManager.emit(packet)
  }

  // ----- LOCATIONS UPDATE ----- //
  sendLocationUpdatedEventBySphereId(sphereId: string, location: LocationData) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendLocationUpdatedEvent(data.sphere, location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/
      })
  }
  sendLocationUpdatedEvent(sphere: SphereData, location: LocationData) {
    let packet = SSEPacketGenerator.generateLocationUpdatedEvent(sphere, location);
    SSEManager.emit(packet)
  }

  // ----- LOCATIONS DELETE ----- //
  sendLocationDeletedEventBySphereId(sphereId: string, stone: CrownstoneData) {
    return EventConstructor.getData({sphereId})
      .then((data) => {
        this.sendLocationDeletedEvent(data.sphere, stone);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
  sendLocationDeletedEvent(sphere: SphereData, location: LocationData) {
    let packet = SSEPacketGenerator.generateLocationDeletedEvent(sphere, location);
    SSEManager.emit(packet)
  }
}

