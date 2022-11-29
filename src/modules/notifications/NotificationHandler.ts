import {Device} from "../../models/device.model";
import {Dbs} from "../containers/RepoContainer";
import {AppInstallation} from "../../models/app-installation.model";
import {User} from "../../models/user.model";
import {Notifications_Gcm} from "../../models/subModels/gcm.model";
import {Notifications_apns} from "../../models/subModels/apns.model";

const gcm = require('node-gcm');
const apn = require('node-apn');

interface NotificationMessage {
  data:   any,     // there has to be a command in here and all data required to do something with the notification.
  type?:   string,  // type of notification ['setSwitchStateRemotely','message', ...]
  title?:  string   // title of the notification.
  badge?: number   // badge number for ios
  silent: boolean,
  silentIOS?: boolean,
}

/**
 *  This class will handle the sending of notifications. API:
 *
 *  messageData: {
 *    data: { any },  // there has to be a command in here and all data required to do something with the notification.
 *    silent: boolean,
 *    type:  string   // type of notification ['setSwitchStateRemotely','message', ...]
 *    title: string   // title of the notification.
 *  }
 *
 *  Provide a sphereId, or a sphere object to notify the hubs, a list of user objects or a list of user ids
 */
class NotificationHandlerClass {

  async collectSphereUsers(sphereId: sphereId) {
    let sphereUsers = await Dbs.sphereAccess.find({where: {and: [{sphereId: sphereId}, {invitePending: false}]}, fields: {"userId": true}});
    return sphereUsers.map((user) => { return user.userId });
  }

  async notifyDevice(device: Device, messageData: NotificationMessage) {
    let installations = await Dbs.appInstallation.find({where: {deviceId: device.id}});
    let {iosTokens, iosDevTokens, androidTokens} = getTokensFromInstallations(installations)
    // check if we have to do something
    this.notifyTokens(iosTokens, iosDevTokens, androidTokens, messageData);
  }

  notifySphereUsers(sphereId: sphereId, messageData: NotificationMessage) {
    this.collectSphereUsers(sphereId)
      .then((userIdArray) => {
        if (userIdArray && Array.isArray(userIdArray)) {
          this.notifyUserIds(userIdArray, messageData);
        }
      });
  }

  // notifySphereUsersExceptUser(excludeUserId: string, sphereId: sphereId, messageData: NotificationMessage) {
  //   // this.collectSphereUsers(sphereId)
  //   //   .then((userIdArray) => {
  //   //     if (userIdArray && Array.isArray(userIdArray)) {
  //   //       this.notifyUserIds(userIdArray, messageData, excludeUserId);
  //   //     }
  //   //   });
  // }
  // notifySphereUsersExceptDevice(excludeDeviceId: string, sphereId: sphereId, messageData: NotificationMessage) {
  //   // this.collectSphereUsers(sphereId)
  //   //   .then((userIdArray) => {
  //   //     if (userIdArray && Array.isArray(userIdArray)) {
  //   //       this.notifyUserIds(userIdArray, messageData, null, excludeDeviceId);
  //   //     }
  //   //   });
  // }
  //
  // notifySphereDevices(sphere: Sphere, messageData: NotificationMessage, excludeDeviceId: string) {
  //   // get users
  //   // if (!messageData.data) { messageData.data = {}; }
  //   // messageData.data = { ...messageData.data, sequenceTime: SphereIndexCache.getLatest(sphere.id) };
  //   //
  //   // sphere.users({include: {relation: 'devices', scope: {include: 'installations'}}}, (err, users) => {
  //   //   let {iosTokens, iosDevTokens, androidTokens} = getTokensFromUsers(users, excludeDeviceId)
  //   //
  //   //   check if we have to do something
  //     // this.notifyTokens(iosTokens, iosDevTokens, androidTokens, messageData);
  //   // });
  // }

  async notifyTokens(iosTokens: string[], iosDevTokens: string[], androidTokens: string[], messageData: NotificationMessage) {
    if (iosTokens.length > 0 || iosDevTokens.length > 0 || androidTokens.length > 0) {
      // get app, currently hardcoded.
      let app = await Dbs.app.findOne({where: {name: 'Crownstone.consumer'}});
      if (app && app.pushSettings) {
        // console.log("Sending notification", messageData)

        this._notifyAndroid(app.pushSettings.gcm, androidTokens, messageData);
        this._notifyIOS(app.pushSettings.apns,    iosTokens, iosDevTokens, messageData);
      }
      else {
        throw new Error("No App to Push to.");
      }
    }
  }

  notifyUserIds(userIds: string[], messageData: NotificationMessage, excludeUserId: string = null, excludeDeviceId: string = null) {
    let userIdArray : {id: string}[] = [];
    for (let i = 0; i < userIds.length; i++) {
      if (userIds[i] === excludeUserId) { continue; }

      userIdArray.push({id:userIds[i]});
    }
    this._notifyUsers(userIdArray, messageData, excludeDeviceId);
  }


  async _notifyUsers(userIdArray: {id: string}[], messageData: NotificationMessage, excludeDeviceId: string = null) {
    if (userIdArray.length === 0) {
      return;
    }

    let users = await Dbs.user.find({where: {or:userIdArray}});
    let {iosTokens, iosDevTokens, androidTokens} = await getTokensFromUsers(users, excludeDeviceId)
    // check if we have to do something
    return this.notifyTokens(iosTokens, iosDevTokens, androidTokens, messageData);
  }


  /**
   * Notify all android devices
   * @param keys      // { serverApiKey: 'xxxxxxx' }
   * @param tokens    // array of tokens
   * @param messageData    // JSON
   * @private
   */
  _notifyAndroid(keys: Notifications_Gcm, tokens: string[], messageData: NotificationMessage) {
    if (tokens.length === 0) {
      return;
    }

    let message = new gcm.Message({
      collapseKey: messageData.title,
      priority: 'high',
      data: messageData.data,
    });

    // Set up the sender with you API key
    let sender = new gcm.Sender(keys.serverApiKey);

    // console.log("Send Message", message)
    // Add the registration tokens of the devices you want to send to
    sender.send(message, {registrationTokens: tokens}, function (err: any, response: any) {
      if (err) {
        // console.log('ANDROID ERROR PUSH', err);
      }
      else {
        // console.log("ANDROID PUSH RESPONSE", response);
      }
    });
  }


  /**
   * Notify all IOS devices
   * @param keys      // {
   *                  //   keyToken: "-----BEGIN PRIVATE KEY-----\n<token here>\n-----END PRIVATE KEY-----',
                      //   keyId: 'xx',
                      //   teamId: 'xx'
                      // }
   * @param tokens    // array of tokens
   * @param messageData  JSON
   * @private
   */
  _notifyIOS(keys: Notifications_apns, tokens: string[], devTokens: string[], messageData: NotificationMessage) {
    let options = {
      token: {
        key: keys.keyToken,
        keyId: keys.keyId,
        teamId: keys.teamId
      },
      production: false
    };

    if (tokens.length > 0)  {
      options.production = true;
      this._sendIOSNotifications(tokens,options,messageData);
    }

    if (devTokens.length > 0)  {
      options.production = false;
      this._sendIOSNotifications(devTokens,options,messageData);
    }
  }

  _sendIOSNotifications(tokens: string[], options: any, messageData: NotificationMessage) {
    let apnProvider = new apn.Provider(options);

    let notification = new apn.Notification();

    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    notification.badge = messageData.badge || 0;    // 0 = remove badge
    notification.payload = messageData.data;
    notification.topic = 'com.crownstone.Crownstone';

    let silent = messageData.silent;
    if (messageData.silentIOS !== undefined) {
      silent = messageData.silentIOS;
    }

    if (silent) {
      // add this for silent push
      notification.contentAvailable = true;
      notification.pushType = "background";
    }
    else {
      notification.pushType = "alert"
      notification.sound = "ping.aiff";       // do not add if no sound should play
      notification.body =  messageData.type;  // alert message body, do not add if no alert has to be shown.
      notification.alert = messageData.title || 'Notification Received'; // alert message, do not add if no alert has to be shown.
    }

    // Send the notification to the API with send, which returns a promise.
    apnProvider.send(notification, tokens)
      .then((result: any) => {
        // console.log("IOS PUSH RESULT", JSON.stringify(result, undefined,2));
      })
      .then(() => {
        apnProvider.shutdown()
      })
      .catch((err: any) => {
        // console.log("ERROR DURING PUSH!", err)
      })
  }
}


function getTokensFromInstallations(
  installations: AppInstallation[],
  iosUniqueTokens: Record<string, boolean> = {},
  iosDevUniqueTokens: Record<string, boolean> = {},
  androidUniqueTokens: Record<string, boolean> = {},
) {
  let iosTokens = [];
  let iosDevTokens = [];
  let androidTokens = [];

  for (let k = 0; k < installations.length; k++) {
    let token = installations[k].deviceToken;
    if (token) {
      switch (installations[k].deviceType) {
        case 'ios':
          if (installations[k].developmentApp === true) {
            if (iosDevUniqueTokens[token] === undefined) {
              iosDevUniqueTokens[token] = true;
              iosDevTokens.push(token);
            }
          }
          else if (iosUniqueTokens[token] === undefined) {
            iosUniqueTokens[token] = true;
            iosTokens.push(token);
          }
          break;
        case 'android':
          if (androidUniqueTokens[token] === undefined) {
            androidUniqueTokens[token] = true;
            androidTokens.push(token);
          }
          break;
      }
    }
  }

  return {iosTokens, iosDevTokens, androidTokens}
}

async function getTokensFromUsers(users: User[] | {id: string}[], excludeDeviceId: string) {
  // get users
  let total_iosTokens     : string[] = [];
  let total_iosDevTokens  : string[] = [];
  let total_androidTokens : string[] = [];

  let iosUniqueTokens = {};
  let iosDevUniqueTokens = {};
  let androidUniqueTokens = {};

  // collect all tokens.
  for (let i = 0; i < users.length; i++) {
    let devices = await Dbs.device.find({where: {ownerId: users[i].id}});
    for (let j = 0; j < devices.length; j++) {
      if (String(devices[j].id) == excludeDeviceId) {
        continue;
      }

      let installations = await Dbs.appInstallation.find({where: {deviceId: devices[j].id}});
      let {iosTokens, iosDevTokens, androidTokens} = getTokensFromInstallations(installations, iosUniqueTokens, iosDevUniqueTokens, androidUniqueTokens);
      total_iosTokens     = total_iosTokens.concat(iosTokens);
      total_iosDevTokens  = total_iosDevTokens.concat(iosDevTokens);
      total_androidTokens = total_androidTokens.concat(androidTokens);
    }
  }

  return {
    iosTokens: total_iosTokens,
    iosDevTokens: total_iosDevTokens,
    androidTokens: total_androidTokens
  }
}


export const NotificationHandler = new NotificationHandlerClass();
