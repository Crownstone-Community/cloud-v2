import {HttpErrors} from "@loopback/rest";
import {VersionUtil} from "../../../util/VersionUtil";

export function getUniqueIdMap<T>(list: T[], idField: string = 'id') : idMap<T> {
  let result: idMap<T> = {};
  for (let i = 0; i < list.length; i++) {
    // @ts-ignore
    let requestedId = list[i][idField];
    result[requestedId] = list[i];
  }
  return result;
}


export function getNestedIdMap<T>(list: T[], idField: string, secondary: string = 'id') : nestedIdMap<T> {
  let nestedIdArray = getNestedIdArray(list, idField);
  let masterKeys = Object.keys(nestedIdArray);
  let nestedResult: nestedIdMap<T> = {};
  for (let i = 0; i < masterKeys.length; i++) {
    let mk = masterKeys[i];
    nestedResult[mk] = getUniqueIdMap(nestedIdArray[mk]);
  }

  return nestedResult;
}

export function getNestedIdArray<T>(list: T[], idField: string) : nestedIdArray<T> {
  let result: nestedIdArray<T> = {};
  if (!list) { list = []; }
  for (let i = 0; i < list.length; i++) {
    // @ts-ignore
    let requestedId = list[i][idField];
    if (result[requestedId] === undefined) {
      result[requestedId] = [];
    }
    result[requestedId].push(list[i]);
  }

  return result;
}


export function getIds(collection: any[]) : string[] {
  let ids = [];
  if (!collection) { collection = []; }
  for (let i = 0; i < collection.length; i++) { ids.push(collection[i].id); }
  return ids;
}


export function getTimestamp(a : Date | number | string) : number {
  let at
  if (typeof a === 'string') {
    at = new Date(a).valueOf();
  }
  else if (a instanceof Date) {
    at = a.valueOf();
  }
  else if (typeof a === 'number') {
    at = a;
  }
  else {
    at = 0;
  }
  return at;
}

export function getSyncIgnoreList(scope? : SyncCategory[]) : SyncIgnoreMap {
  if (scope === undefined) { return getSyncCategories(false); }

  let categories = getSyncCategories(true);
  for (let i = 0; i < scope.length; i++) {
    if (categories[scope[i]] !== undefined) {
      categories[scope[i]] = false;
    }
    else {
      throw new HttpErrors.BadRequest("Invalid scope")
    }
  }
  return categories;
}

function getSyncCategories(value: boolean) : SyncIgnoreMap {
  return {
    abilities:       value,
    behaviours:      value,
    bootloader:      value,
    features:        value,
    firmware:        value,
    hubs:            value,
    keys:            value,
    locations:       value,
    messages:        value,
    properties:      value,
    scenes:          value,
    spheres:         value,
    sphereUsers:     value,
    stones:          value,
    trackingNumbers: value,
    toons:           value,
    user:            value,
  };
}

export function filterForAppVersion<T extends {minimumAppVersion: string}>(data: T[], appVersion : string | null) : T[] {
  if (appVersion) {
    let filteredResults = [];
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (!item.minimumAppVersion || VersionUtil.isHigherOrEqual(appVersion, item.minimumAppVersion)) {
        filteredResults.push(item);
      }
    }
    return filteredResults;
  }
  return data;
}

export function sortByHardwareVersion<T>(hardwareVersions: string[], data: T[]) : {[hwVersion:string]: T[]} {
  let result : {[hwVersion:string]: T[] } = {};
  for (let i = 0; i < hardwareVersions.length; i++) {
    let hwVersion = hardwareVersions[i];
    result[hwVersion] = [];

    data.forEach((item) => {
      // @ts-ignore
      if (item.supportedHardwareVersions.indexOf(hwVersion) !== -1) {
        result[hwVersion].push(item);
      }
    })
  }
  return result;
}


export function getHighestVersionPerHardwareVersion<T extends { version: string }>(hardwareVersions: string[], data: {[hwVersion:string]: T[]}) : {[hwVersion:string]: string} {
  let result : { [hardwareVersion: string]: string } = {};
  for (let i = 0; i < hardwareVersions.length; i++) {
    let hwVersion = hardwareVersions[i];
    let latestVersion = '0.0.0';
    for (let j = 0; j < data[hwVersion].length; j++) {
      let item = data[hwVersion][j];
      if (VersionUtil.isHigher(item.version, latestVersion)) {
        latestVersion = item.version;
      }
    }
    if (latestVersion !== '0.0.0') {
      result[hwVersion] = latestVersion;
    }
    else {
      result[hwVersion] = null;
    }
  }
  return result;
}

export function processCreationMap(creationMap: creationMap, data: any) {
  for (let dataId in data) {
    let value = data[dataId];
    if (creationMap[value] !== undefined) {
      if (dataId.indexOf("Id") !== -1) {
        data[dataId] = String(creationMap[value]);
      }
    }
  }
  return data;
}

