import {Dbs} from "../../containers/RepoContainer";
import Timeout = NodeJS.Timeout;
import {Sphere} from "../../../models/sphere.model";
import {Stone} from "../../../models/stone.model";
import {Location} from "../../../models/location.model";
import {User} from "../../../models/user.model";

const USER_FIELDS     = {id: true, firstName: true, lastName: true};
const STONE_FIELDS    = {name: true, address: true, uid: true};
const SPHERE_FIELDS   = {id:true, name: true, uid: true};
const LOCATION_FIELDS = {id:true, name: true};
const ABILITY_FIELDS  = {type:true, enabled: true, syncedToCrownstone: true};

interface EventDataMapOptions {
  user?: User,
  users?: User[],
  sphere?: Sphere,
}

/**
 * This cache is used for the SSE events. It allows us to lookup some data for events and reuse that if it is queried soon after.
 * This is done when we have already obtained the item for a certain ID and it would be a waste of a request to the db to get it again.
 * The merge function is then used before the call that generates an event to update the cached item-id combination.
 */
class ShortLivedCache<T> {

  lifetimeSeconds = 5;
  ids : {[id:string]: { data: T, timeout: Timeout }} = {};

  bumpTimeout(id: string) {
    if (this.ids[id]) {
      clearTimeout(this.ids[id].timeout);
      this.ids[id].timeout = setTimeout(() => {
        delete this.ids[id];
      }, 1000 * this.lifetimeSeconds);
    }
  }

  get(id: string) : T | null {
    if (this.ids[id]) {
      this.bumpTimeout(id);
      return this.ids[id].data;
    }
    return null;
  }

  load(id: string, data: T) {
    if (this.ids[id] === undefined) {
      // @ts-ignore
      this.ids[id] = {};
    }
    this.ids[id].data = data;
    this.bumpTimeout(id);
  }

  merge(id: string, item: object) {
    if (this.ids[id] !== undefined) {
      let keys = Object.keys(item);
      for (let i = 0; i < keys.length; i++) {
        // @ts-ignore
        this.ids[id].data[keys[i]] = item[keys[i]];
      }
    }
  }

  remove(id: string) {
    if (this.ids[id]) {
      clearTimeout(this.ids[id].timeout);
      delete this.ids[id];
    }
  }
}

export const EventSphereCache   = new ShortLivedCache<Sphere>()
export const EventStoneCache    = new ShortLivedCache<Stone>()
export const EventLocationCache = new ShortLivedCache<Location>()
export const EventUserCache     = new ShortLivedCache<User>()



export class EventConstructor {

  static async getStoneData(stoneId: string) : Promise<CrownstoneSwitchState> {
    try {
      let stone = EventStoneCache.get(stoneId);
      if (!stone) {
        stone = await Dbs.stone.findById(stoneId, {include: [{relation: 'currentSwitchState'}], fields: STONE_FIELDS});
        EventStoneCache.load(stoneId, stone);
      }
      return { id: stoneId, name: stone.name, macAddress: stone.address, uid: stone.uid, percentage: stone.currentSwitchState?.switchState || null }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getSphereData(sphereId: string) : Promise<SphereData> {
    try {
      let sphere = EventSphereCache.get(sphereId);
      if (!sphere) {
        sphere = await Dbs.sphere.findById(sphereId, {fields: SPHERE_FIELDS});
        EventSphereCache.load(sphereId, sphere);
      }
      return EventConstructor.mapSphereData(sphere);
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static mapSphereData(sphere: Sphere) : SphereData {
    return { id: sphere.id, name: sphere.name, uid: sphere.uid }
  }

  static async getLocationData(locationId: string) : Promise<LocationData> {
    try {
      let location = EventLocationCache.get(locationId);
      if (!location) {
        location = await Dbs.location.findById(locationId, {fields: LOCATION_FIELDS});
        EventLocationCache.load(locationId, location);
      }
      return { id: locationId, name: location.name }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getAbilityData(abilityId: string) : Promise<AbilityData> {
    try {
      let ability = await Dbs.stoneAbility.findById(abilityId, {fields: ABILITY_FIELDS});
      // @ts-ignore
      return { type: ability.type, enabled: ability.enabled, syncedToCrownstone: ability.syncedToCrownstone, }
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static async getUserData(userId : string) : Promise<UserData> {
    try {
      let user = EventUserCache.get(userId);
      if (!user) {
        user = await Dbs.user.findById(userId, {fields: USER_FIELDS});
        EventUserCache.load(userId, user);
      }
      return EventConstructor.mapUserData(user);
    }
    catch (e) {
      throw {code: 401, message: "Not available" };
    }
  }

  static mapUserData(user:User) : UserData {
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

    return { id: user.id, name: userName }
  }

  static async getData(options: EventDataRequestOptions) : Promise<EventDataResult> {
    let result : EventDataResult = {};

    if (options.userId) {
      result.user = await EventConstructor.getUserData(options.userId);
    }
    if (options.userIds) {
      result.users = [];
      for (let userId of options.userIds) {
        result.users[userId] = await EventConstructor.getUserData(userId);
      }
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
    if (options.abilityId) {
      result.ability = await EventConstructor.getAbilityData(options.abilityId);
    }

    return result;
  }



  static mapData(options: EventDataMapOptions) : EventDataResult {
    let result : EventDataResult = {};

    if (options.user) {
      result.user = EventConstructor.mapUserData(options.user);
    }
    if (options.users) {
      result.users = [];
      for (let user of options.users) {
        result.users[user.id] = EventConstructor.mapUserData(user);
      }
    }
    if (options.sphere) {
      result.sphere = EventConstructor.mapSphereData(options.sphere)
    }


    return result;
  }
}

