import {TimestampedCrudRepository} from "../../../repositories/bases/timestamped-crud-repository";


/**
 * This function will parse a
 * {
    [itemId: string]: RequestItemCoreType
   }
 * from a handleRequestSync and give it's reply. This has to be done a lot, so there are a lot of variables in here to avoid
 * code duplication.
 *
 * @param fieldname                 | This is the name of the field in the sphere. Things like 'hubs', 'locations', etc.
 * @param db                        | This is the database that contains those items.
 * @param requestItems              | This is the parent of the category from the request. So if the field is hubs, the clientSource is a sphere sync request (thats where the fieldname comes from)
 * @param replySource               | This is the parent of where we're going to put the reply.
 * @param role                      | The access role of the authenticated user in this sphere.
 * @param editPermissions           | This is a map of which access roles have the permission to edit.
 * @param updateEventCallback       | A callback function that is called when the cloud item is updated.
 * @param updateClientItemCallback  | This callback is used to handle nested fields. It is difficult to read but this avoids a lot of code duplication. Used for abilityProperties
 */
export async function processSyncReply<T extends UpdatedAt>(
  fieldname: DataCategory,
  db: TimestampedCrudRepository<any, any>,
  requestItems: any,
  replySource: any,
  role: ACCESS_ROLE,
  editPermissions: RolePermissions,
  updateEventCallback: (itemId: string, clientData: any) => void,
  updateClientItemCallback?: (replyAtPoint: any, clientItem: any, itemId: string) => Promise<void>,
  ) {
  if (requestItems[fieldname]) {
    replySource[fieldname] = {};
    let requestItemIds = Object.keys(requestItems[fieldname] || {});
    for (let i = 0; i < requestItemIds.length; i++) {
      let itemId = requestItemIds[i];
      replySource[fieldname][itemId] = {};
      if (editPermissions[role] !== true) {
        replySource[fieldname][itemId].data = {status: "ACCESS_DENIED"};
        continue;
      }
      let item = requestItems[fieldname][itemId];
      // update model in cloud.
      try {
        await db.updateById(itemId, item.data, {acceptTimes: true});
        replySource[fieldname][itemId].data = {status: "UPDATED_IN_CLOUD"};
        updateEventCallback(itemId, item)
      }
      catch (err : any) {
        replySource[fieldname][itemId].data = { status: "ERROR", error: {code: err?.statusCode ?? 0, msg: err?.message ?? err} };
      }

      if (updateClientItemCallback) {
        await updateClientItemCallback(replySource[fieldname][itemId], item, itemId);
      }

    }
  }
}
