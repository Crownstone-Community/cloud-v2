import {SSEPacketGenerator} from "./SSEPacketGenerator";
import {SSEManager} from "../SSEManager";
import {Sphere} from "../../../models/sphere.model";
import {User} from "../../../models/user.model";
import {EventConstructor} from "./EventConstructor";


export class TransformEventHandler {

  sendTransformSessionRequestedEvent(sphere: Sphere, sessionId: string, userA: User, userB: User, deviceIdA: string, deviceIdB: string) {
    let mappedData = EventConstructor.mapData({sphere, users:[userA, userB]});
    let packet = SSEPacketGenerator.generateTransformSessionRequestedEvent(
      mappedData.sphere,
      sessionId,
      mappedData.users[userA.id],
      mappedData.users[userB.id],
      deviceIdA,
      deviceIdB
    );
    SSEManager.emit(packet);
  }

  sendTransformSessionStoppedEvent(sphere: Sphere, sessionId: string) {
    let mappedData = EventConstructor.mapData({sphere});
    let packet = SSEPacketGenerator.generateTransformSessionStoppedEvent(
      mappedData.sphere,
      sessionId,
    );
    SSEManager.emit(packet);
  }


  sendTransformSessionReadyEvent(sphere: Sphere, sessionId: string, userA: User, userB: User, deviceIdA: string, deviceIdB: string) {
    let mappedData = EventConstructor.mapData({sphere, users:[userA, userB]});
    let packet = SSEPacketGenerator.generateTransformSessionReadyEvent(
      mappedData.sphere,
      sessionId,
      mappedData.users[userA.id],
      mappedData.users[userB.id],
      deviceIdA,
      deviceIdB
    );
    SSEManager.emit(packet);
  }


  sendTransformDatacollectionStartedEvent(sphere: Sphere, sessionId: string, collectionId: string) {
    let mappedData = EventConstructor.mapData({sphere});
    let packet = SSEPacketGenerator.generateTransformDatacollectionStartedEvent(
      mappedData.sphere,
      sessionId,
      collectionId
    );
    SSEManager.emit(packet);
  }


  sendTransformDatacollectionReceivedEvent(sphere: Sphere, sessionId: string, collectionId: string, user: User, deviceId: string) {
    let mappedData = EventConstructor.mapData({sphere, user});
    let packet = SSEPacketGenerator.generateTransformDatacollectionReceivedEvent(
      mappedData.sphere,
      sessionId,
      collectionId,
      mappedData.user,
      deviceId
    );
    SSEManager.emit(packet);
  }


  sendTransformDatacollectionFinishedEvent(sphere: Sphere, sessionId: string, collectionId: string, quality: {userA: Record<string,number>, userB: Record<string,number>}) {
    let mappedData = EventConstructor.mapData({sphere});
    let packet = SSEPacketGenerator.generateTransformDatacollectionFinishedEvent(
      mappedData.sphere,
      sessionId,
      collectionId,
      quality
    );
    SSEManager.emit(packet);
  }


  sendTransformSetFinishedEvent(sphere: Sphere, sessionId: string, result: TransformResult) {
    let mappedData = EventConstructor.mapData({sphere});
    let packet = SSEPacketGenerator.generateTransformSetFinishedEvent(
      mappedData.sphere,
      sessionId,
      result
    );
    SSEManager.emit(packet);
  }
}
