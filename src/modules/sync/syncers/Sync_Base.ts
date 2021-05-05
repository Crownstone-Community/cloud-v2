import {processSyncCollection} from "../helpers/SyncHelpers";
import {TimestampedCrudRepository} from "../../../repositories/bases/timestamped-crud-repository";
import {processSyncReply} from "../helpers/SyncReplyHelper";
import {CrudRepository} from "@loopback/repository";

interface idMap {[ids: string]:string}
interface accessMap {admin?: boolean, member?:boolean, guest?:boolean}


export class Sync_Base<T extends UpdatedAt, U extends RequestItemCoreType> {

  fieldName : SyncCategory;
  db : TimestampedCrudRepository<any, any>

  writePermissions : accessMap;
  editPermissions  : accessMap;
  accessRole: ACCESS_ROLE;
  sphereId: string;

  requestSphere: any;
  replySphere: any;
  creationMap: creationMap;
  creationAdditions: idMap = {};

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

  async processRequest(cloud_data : any = {}, creationAdditions? : idMap) {
    this.setCreationAdditions();
    await processSyncCollection<T,U>(
      this.fieldName,
      this.db,
      creationAdditions || this.creationAdditions,
      this.requestSphere,
      this.replySphere,
      this.creationMap,
      this.accessRole,
      this.writePermissions,
      this.editPermissions,
      cloud_data,
      this.createEventCallback.bind(this),
      this.syncClientItemCallback.bind(this),
      this.syncCloudItemCallback.bind(this),
      this.markChildrenAsNew.bind(this)
    );
  }

  /**
   * This handles the reply phase of the syncing process.
   */
  async processReply() {
    await processSyncReply(
      this.fieldName,
      this.db,
      this.requestSphere,
      this.replySphere,
      this.accessRole,
      this.editPermissions,
      this.updateEventCallback.bind(this),
      this.syncClientItemReplyCallback.bind(this),
    );
  }

  /**
   * This callback allows the syncing model to emit an SSE event when a new item is created in the cloud db.
   * @param item  | This is the instance of the newly created datamodel.
   */
  createEventCallback(clientItem: U, cloudItem: T) {
    // OVERRIDE BY CHILD CLASSES
  }

  /**
   * This callback allows the syncing model to emit an SSE event when an item in the cloud db has been updated.
   * @param item  | This is the instance of the newly created datamodel.
   */
  updateEventCallback(itemId: string, updatedItem: T) {
    // OVERRIDE BY CHILD CLASSES
  }

  /**
   * This callback is used to handle nested fields. It is difficult to read but this avoids a lot of code duplication. Used for abilityProperties
   * @param item  | This is the instance of the newly created datamodel.
   */
  async syncClientItemReplyCallback(replyAtPoint: any, clientItem: U, cloudId: string) {
    // OVERRIDE BY CHILD CLASSES
  }

  /**
   * This callback is used to handle nested fields. It is difficult to read but this avoids a lot of code duplication. Used for behaviour, abilities & abilityProperties
   * @param replyAtPoint
   * @param clientItem
   * @param id
   * @param cloudId
   */
  async syncClientItemCallback(replyAtPoint: any, clientItem: U, id: string, cloudId: string) {
    // OVERRIDE BY CHILD CLASSES
  }

  /**
   * This callback is used to explore nested fields when the cloud is providing the user with new data. Used for behaviour, abilities & abilityProperties
   * @param replyAtPoint
   * @param cloudItem
   * @param cloudId
   */
  async syncCloudItemCallback(replyAtPoint: any, cloudItem: T, cloudId: string) {
    // OVERRIDE BY CHILD CLASSES
  }

  /**
   * This callback is used to mark any nested fields as new if the parent is new.
   * If an item has nested fields (like a stone has behaviour, abilities) and the stone is marked as new,
   * this callback allows us to mark the behaviours and abilities as new as well.
   * This can correct user error and catch errors in our setup.
   * @param clientItem
   */
  markChildrenAsNew(clientItem: U) {
    // OVERRIDE BY CHILD CLASSES
  }
}