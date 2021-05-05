import {TimestampedCrudRepository} from "../../../repositories/bases/timestamped-crud-repository";
import {CrudRepository} from "@loopback/repository";

export class Sync_Base_Custom<T extends UpdatedAt, U extends RequestItemCoreType> {

  fieldName : SyncCategory;
  db : TimestampedCrudRepository<any, any> | CrudRepository<any>

  writePermissions : accessMap;
  editPermissions  : accessMap;
  accessRole: ACCESS_ROLE;
  sphereId: string;

  requestSphere: any;
  replySphere: any;
  creationMap: creationMap;
  creationAdditions: idMap<string> = {};

  constructor(sphereId: string, accessRole: ACCESS_ROLE, requestSphere: any, replySphere: any, creationMap: creationMap ) {
    this.requestSphere = requestSphere
    this.replySphere = replySphere;
    this.creationMap = creationMap;
    this.accessRole = accessRole;
    this.sphereId = sphereId;
  }

  /**
   * When the new data entry is created, not all linked ids might be in the data. This adds those. Think sphereId etc.
   * This usually is the sphereId, but this can be overloaded when required.
   * It can also be provided to the sync method, in case the required id is only available there.
   * When it is provided with the sync call, this method becomes irrelevant.
   */
  setCreationAdditions() {
    this.creationAdditions = {sphereId: this.sphereId}
  }

  async processRequest(cloud_data : any = {}, creationAdditions? : idMap<string>) {
    this.setCreationAdditions();
    // OVERRIDE BY CHILD CLASSES
  }

  /**
   * This handles the reply phase of the syncing process.
   */
  async processReply() {
    // OVERRIDE BY CHILD CLASSES
  }


}