import {DataObject} from "@loopback/repository";
import {getTimestamp} from "./SyncUtil";


export async function getShallowReply<T extends UpdatedAt>(requestObject: UpdatedAt | undefined, cloudEntity: T | null, getter: () => Promise<T>) : Promise<{ status: SyncState, data?: DataObject<T>}> {
  if (!cloudEntity) {
    return { status: "NOT_AVAILABLE" }
  }
  if (!requestObject || requestObject.updatedAt === undefined) {
    return { status:"NEW_DATA_AVAILABLE", data: await getter() };
  }
  else {
    return getReplyBasedOnTime<T>(requestObject.updatedAt, cloudEntity.updatedAt, cloudEntity)
  }
}


export async function getReply<T extends UpdatedAt>(requestObject: RequestItemCoreType | null | undefined, cloudEntity: T | null | undefined, getter: () => Promise<T>) : Promise<{ status: SyncState, data?: DataObject<T>}> {
  if (!cloudEntity) {
    if (requestObject.new) {
      throw "New should have been handled before.";
    }
    else {
      return { status: "NOT_AVAILABLE" }
    }
  }
  else if (!requestObject) {
    return { status:"NEW_DATA_AVAILABLE", data: await getter() };
  }
  else {
    return getReplyBasedOnTime<T>(requestObject.data.updatedAt, cloudEntity.updatedAt, cloudEntity)
  }
}

export function getReplyBasedOnTime<T extends UpdatedAt>(request : Date | number | string, cloud : Date | number | string, cloudEntity: T) : { status: SyncState, data?: DataObject<T>} {
  let requestT = getTimestamp(request);
  let cloudT   = getTimestamp(cloud);

  if (requestT === cloudT) {
    return { status: "IN_SYNC"};
  }
  else if (requestT < cloudT) {
    return { status: "NEW_DATA_AVAILABLE", data: cloudEntity };
  }
  else {
    return { status: "REQUEST_DATA"};
  }
}
