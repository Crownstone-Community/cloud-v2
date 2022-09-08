import {MessageV2} from "../../models/messageV2.model";
import {SphereAccessUtil} from "../../util/SphereAccessUtil";
import {NotificationHandler} from "./NotificationHandler";


interface NotificationData {
  command: 'messageAdded',
  sphereId: sphereId,
  message:  Partial<MessageV2>,
}

export const NotificationUtil = {
  messageForUserIds: function(userIds: string[], message: MessageV2) {
    NotificationHandler.notifyUserIds(userIds, this._getMessageFormat(message));
  },

  messageForSphere: async function(sphereId: sphereId, message: MessageV2) {
    let sphereUserIds = await SphereAccessUtil.getSphereUserIds(sphereId);
    NotificationHandler.notifyUserIds(sphereUserIds, this._getMessageFormat(message));
  },


  _getMessageFormat: function(message: MessageV2) {
    return {
      silent: true,
      data: {
        command: 'messageAdded',
        sphereId: message.sphereId,
        message:  message,
      },
    }
  }
};

