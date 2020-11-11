
export function getUniqueIdMap<T>(list: T[], idField: string = 'id') : idMap<T> {
  let result: idMap<T> = {};
  for (let i = 0; i < list.length; i++) {
    // @ts-ignore
    let requestedId = list[i][idField];
    result[requestedId] = list[i];
  }
  return result;
}

export function getNestedIdMap<T>(list: T[], idField: string) : nestedIdMap<T> {
  let result: { [id: string]: T[] } = {};
  for (let i = 0; i < list.length; i++) {
    // @ts-ignore
    let requestedId = list[i][idField];
    if (result[requestedId] === undefined) {
      result[requestedId] = [];
    }
    result[requestedId].push(list[i]);
  }
  let masterKeys = Object.keys(result);
  let nestedResult: nestedIdMap<T> = {};
  for (let i = 0; i < masterKeys.length; i++) {
    let mk = masterKeys[i];
    nestedResult[mk] = getUniqueIdMap(result[mk]);
  }

  return nestedResult;
}


export function getIds(collection: any[]) : string[] {
  let ids = [];
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

export function getSyncIgnoreList(scope? : SyncCategory[]) : SyncIgnoreList {
  if (scope === undefined) { return getSyncCategories(false); }

  let categories = getSyncCategories(true);
  for (let i = 0; i < scope.length; i++) {
    if (categories[scope[i]] !== undefined) {
      categories[scope[i]] = false;
    }
  }
  return categories;
}

function getSyncCategories(value: boolean) : SyncIgnoreList {
  return {
    hubs:            value,
    features:        value,
    abilities:       value,
    behaviours:      value,
    messages:        value,
    properties:      value,
    locations:       value,
    scenes:          value,
    stones:          value,
    trackingNumbers: value,
    toons:           value,
  }
}