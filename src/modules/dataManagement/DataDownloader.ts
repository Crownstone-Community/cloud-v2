import {Dbs} from "../containers/RepoContainer";
import {GridFsUtil} from "../../util/GridFsUtil";
import {AccessLevels, SphereAccess} from "../../models/sphere-access.model";
import path from "path";
import {getEncryptionKeys} from "../sync/helpers/KeyUtil";
import {Device} from "../../models/device.model";
import {FingerprintLinker} from "../../models/fingerprint-linker.model";
import {Util} from "../../util/Util";
var AdmZip = require("adm-zip");

const THROTTLE_TIME = 5*60*1000; // 5 minutes;
const SESSION_LIMIT = 5;         // max consecutive sessions to download user data.

export class UserDataManagementThrottleClass {

  userIds  : Record<string, number> = {};
  sessions : Record<string, number> = {};

  waitingSessions : Record<string, any> = {};
  waitingSessionsQueue : string[]       = [];


  allowUserSession(userId: string) : boolean {
    let lastTime = this.userIds[userId];
    if (!lastTime) { return true; }
    return Date.now() - lastTime > THROTTLE_TIME
  }

  async waitToInitiateSession(userId: string) : Promise<void> {
    return new Promise((resolve, reject) => {
      let cleanup = (err: string) => {
        this.waitingSessions[userId].reject(new Error(err))
        clearTimeout(this.waitingSessions[userId].timeout);
        let index = this.waitingSessionsQueue.indexOf(userId);
        if (index !== -1) { this.waitingSessionsQueue.splice(index,1); }
        delete this.waitingSessions[userId];
      }

      if (this.waitingSessions[userId]) {
        cleanup("ALREADY_IN_QUEUE");
      }

      let timeout = setTimeout(() => {
        cleanup("REQUEST_WAIT_TIMEOUT");
      }, 15000);

      this.waitingSessions[userId] = {resolve, reject, timeout};
      this.waitingSessionsQueue.push(userId);
    })
  }


  async startSession(userId: string) {
    if (Object.keys(this.sessions).length > SESSION_LIMIT) {
      await this.waitToInitiateSession(userId);
    }

    this.sessions[userId] = Date.now();
    this.userIds[userId]  = Date.now();
  }


  endSession(userId: string) {
    delete this.sessions[userId];

    let nextUserId = this.waitingSessionsQueue.shift();
    if (nextUserId) {
      this.waitingSessions[nextUserId].resolve();
      clearTimeout(this.waitingSessions[nextUserId].timeout);
      delete this.waitingSessions[nextUserId];
    }

    // delete old entries of the request method.
    let cutoff = Date.now() - THROTTLE_TIME;
    for (let userId in this.userIds) {
      if (this.userIds[userId] <= cutoff) {
        delete this.userIds[userId];
      }
    }
  }
}

export const UserDataDownloadThrottle = new UserDataManagementThrottleClass();


export class DataDownloader {
  userId: string;
  zipFile: any;


  constructor(userId: string) {
    this.userId = userId;
    this.zipFile = new AdmZip();
  }

  async download() {
    await UserDataDownloadThrottle.startSession(this.userId);

    try {
      let user = await Dbs.user.findById(this.userId);

      // download the user data
      this.addJson(user,'user');

      // get the user profile picture
      await this.addFile(user.profilePicId, 'user profile picture');

      // download all devices
      let devices = await Dbs.device.find({
        where: {ownerId: this.userId },
        include: [
          {relation: 'installations'},
          {relation: 'preferences'},
          {relation: 'locationMap'},
          {relation: 'sphereMap'},
        ]});

      this.addJson(devices,'devices');

      let deviceIds = devices.map((device: Device) => { return device.id; })
      let fingerprintLinks = await Dbs.fingerprintLinker.find({where: {deviceId: {inq: deviceIds}}});
      let fingerprintIds = fingerprintLinks.map((fingerprintLink: FingerprintLinker) => { return fingerprintLink.fingerprintId; })

      // download all fingerprints
      let fingerprints = await Dbs.fingerprint.find({where: {id: {inq: fingerprintIds}}});
      this.addJson(fingerprints,'fingerprints');

      // download spehres (where member or admin)
      let spheresWithAccess : SphereAccess[] = await Dbs.sphereAccess.find({
        where: {
          and: [
            {userId: this.userId}, {invitePending: false}, {role: {inq:[AccessLevels.admin, AccessLevels.member]}}
          ]
        }, fields:{sphereId:true, role:true}});
      let sphereIds = spheresWithAccess.map((data) => { return data.sphereId; })
      let roles     = spheresWithAccess.map((data) => { return data.role; })
      let spheres   = await Dbs.sphere.find({where:{id:{inq: sphereIds}}});

      // get sphere contents
      for (let i = 0;  i < spheres.length; i++) {
        let sphere       = spheres[i];
        let roleInSphere = roles[i];
        let sphereId     = sphere.id;

        this.addJson(sphere,sphere.name, 'spheres');

        // get scenes
        let scenes = await Dbs.scene.find({where:{sphereId: sphereId}});
        this.addJson(scenes, 'scenes', ['spheres', sphere.name]);

        // get custom images
        for (let scene of scenes) {
          if (scene.customPictureId) {
            await this.addFile(scene.customPictureId, ['spheres', sphere.name, 'images','scenes']);
          }
        }

        let stoneIds = (await Dbs.stone.find({where:{sphereId: sphereId}, fields: {id: true}})).map((stone) => { return stone.id; })
        for (let stoneId of stoneIds) {
          // get stones
          let stone = await Dbs.stone.findById(stoneId);
          let behaviour = await Dbs.stoneBehaviour.find({where:{stoneId: stoneId}});
          let abilities = await Dbs.stoneAbility.find({where:{stoneId: stoneId}, include: [{relation: 'properties'}]});
          let switchStateHistory = await Dbs.stoneSwitchState.find({where:{stoneId: stoneId}});

          // Adding keys to stone if the user is an admin.
          if (roleInSphere === 'admin') {
            let keys = await Dbs.stoneKeys.find({where: {stoneId: stoneId}});
            if (keys.length > 0) {
              // @ts-ignore
              stone.keys = keys;
            }
          }
          if (behaviour.length > 0)           { stone.behaviours = behaviour; }
          if (abilities.length > 0)           { stone.abilities = abilities; }
          if (switchStateHistory.length > 0)  { stone.switchStateHistory = switchStateHistory; }

          this.addJson(stone, stone.name, ['spheres', sphere.name, 'crownstones'])
          await Util.wait(250);
        }
        // get locations
        let locations = await Dbs.location.find({where:{sphereId: sphereId}});
        for (let location of locations) {
          if (location.imageId) {
            await this.addFile(location.imageId, ['spheres', sphere.name, 'images','locations']);
          }
        }
        this.addJson(locations, 'locations', ['spheres', sphere.name]);
        // get hubs
        this.addJson(await Dbs.hub.find({where:{sphereId: sphereId}}), 'hubs', ['spheres', sphere.name]);
        // get toons
        this.addJson(await Dbs.toon.find({where:{sphereId: sphereId}}), 'toons', ['spheres', sphere.name]);
        // get sphere keys (you have access to)
        this.addJson(await getEncryptionKeys(this.userId, sphereId, null, [spheresWithAccess[i]]), 'keys', ['spheres', sphere.name]);
        // get messages (sent by you)
        this.addJson(await Dbs.message.find({where:{and: [{sphereId: sphereId},{ownerId: this.userId}]}}), 'messages', ['spheres', sphere.name]);

        await Util.wait(250);
      }
      let buffer = this.zipFile.toBuffer()
      return buffer;
    }
    catch (err) {
      console.log("ERROR", err)
    }
    finally {
      UserDataDownloadThrottle.endSession(this.userId);
    }
  }

  async addFile(fileId?: string, pathArray: string | string[] = []) {
    if (fileId) {
      try {
        let fileData = await GridFsUtil.downloadFileFromId(fileId);

        let filePathArray = ['data'];
        if (Array.isArray(pathArray)) {
          filePathArray = filePathArray.concat(pathArray);
        }
        else {
          filePathArray.push(pathArray);
        }

        let filename = fileData.meta.filename.split("?r=")[0];
        filePathArray.push(filename);

        let filePath = path.join.apply(this,filePathArray);

        // add file directly
        this.zipFile.addFile(filePath, fileData.data, "entry comment goes here");
      }
      catch (err) {
        console.log("Cloud not get file.", err, pathArray, fileId);
      }
    }
  }

  async addJson(data: any, filename: string, pathArray: string | string[] = []) {
    if (!data) { return; }
    else if (Array.isArray(data)) {
      if (data.length === 0) { return; }
    }
    else if (typeof data === 'object') {
      if (Object.keys(data).length === 0) {
        return;
      }
    }

    let stringifiedData = JSON.stringify(data, null, 2);

    let filePathArray = ['data'];
    if (Array.isArray(pathArray)) {
      filePathArray = filePathArray.concat(pathArray);
    }
    else {
      filePathArray.push(pathArray);
    }

    filePathArray.push(`${filename}.json`);

    let filePath = path.join.apply(this,filePathArray);
    this.zipFile.addFile(filePath, Buffer.from(stringifiedData, "utf8"))
  }

}
