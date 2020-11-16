import {Dbs} from "../../containers/RepoContainer";

const USER_FIELDS     = {id: true, firstName: true, lastName: true};
const STONE_FIELDS    = {name: true, address: true, uid: true};
const SPHERE_FIELDS   = {id:true, name: true, uid: true};
const LOCATION_FIELDS = {id:true, name: true};


export class EventConstructor {

  static async getStoneData(stoneId: string) : Promise<CrownstoneSwitchState> {
    try {
      let stone = await Dbs.stone.findById(stoneId, {include: [{relation: 'currentSwitchState'}], fields: STONE_FIELDS});
      return { id: stoneId, name: stone.name, macAddress: stone.address, uid: stone.uid, percentage: stone.currentSwitchState?.switchState || null }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getSphereData(sphereId: string) : Promise<SphereData> {
    try {
      let sphere = await Dbs.sphere.findById(sphereId, {fields: SPHERE_FIELDS});
      return { id: sphereId, name: sphere.name, uid: sphere.uid }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getLocationData(locationId: string) : Promise<LocationData> {
    try {
      let location = await Dbs.location.findById(locationId, {fields: LOCATION_FIELDS});
      return { id: locationId, name: location.name }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getUserData(userId : string) : Promise<UserData> {
    try {
      let user = await Dbs.user.findById(userId, {fields: USER_FIELDS});
      let userName;
      if (!user.firstName) {
        if (!user.lastName) {
          userName = "Anonymous";
        }
        else {
          userName = user.lastName;
        }
      }
      else {
        if (!user.lastName) {
          userName = user.firstName;
        }
        else {
          userName = user.firstName + ' ' + user.lastName;
        }
      }

      return { id: userId, name: userName }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getData(options: EventDataRequestOptions) : Promise<EventDataResult> {
    let result : EventDataResult = {};

    if (options.userId) {
      result.user = await EventConstructor.getUserData(options.userId);
    }
    if (options.stoneId) {
      result.stone = await EventConstructor.getStoneData(options.stoneId);
    }
    if (options.sphereId) {
      result.sphere = await EventConstructor.getSphereData(options.sphereId)
    }
    if (options.locationId) {
      result.location = await EventConstructor.getLocationData(options.locationId);
    }

    return result;
  }
}

