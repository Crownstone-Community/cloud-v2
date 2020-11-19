import {EventConstructor} from "./EventConstructor";
import {SSEPacketGenerator} from "./SSEPacketGenerator";
import {SSEManager} from "../SSEManager";


export class PresenceEventHandler {

  sendEnterSphere(user: UserData, sphere: SphereData) {
    let packet = SSEPacketGenerator.generateEnterSphereEvent(user, sphere);
    SSEManager.emit(packet)
  }

  sendExitSphere(user: UserData, sphere: SphereData) {
    let packet = SSEPacketGenerator.generateExitSphereEvent(user, sphere);
    SSEManager.emit(packet)
  }

  sendEnterLocation(user: UserData, sphere: SphereData, location: LocationData) {
    let packet = SSEPacketGenerator.generateEnterLocationEvent(user, sphere, location);
    SSEManager.emit(packet)
  }

  sendExitLocation(user: UserData, sphere: SphereData, location: LocationData) {
    let packet = SSEPacketGenerator.generateExitLocationEvent(user, sphere, location);
    SSEManager.emit(packet)
  }


  sendEnterSphereFromId(userId: string, sphereId: string) {
    EventConstructor.getData({userId, sphereId})
      .then((data) => {
        this.sendEnterSphere(data.user, data.sphere);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }

  sendExitSphereFromId(userId: string, sphereId: string) {
    EventConstructor.getData({userId, sphereId})
      .then((data) => {
        this.sendExitSphere(data.user, data.sphere);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }

  sendEnterLocationFromId(userId: string, sphereId: string, locationId: string) {
    EventConstructor.getData({userId, sphereId, locationId})
      .then((data) => {
        this.sendEnterLocation(data.user, data.sphere, data.location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }

  sendExitLocationFromId(userId: string, sphereId: string, locationId: string) {
    EventConstructor.getData({userId, sphereId, locationId})
      .then((data) => {
        this.sendExitLocation(data.user, data.sphere, data.location);
      })
      .catch((err) => { /** ignore error, simply do not generate event. **/ })
  }
}
