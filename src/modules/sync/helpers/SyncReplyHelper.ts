import {TimestampedCrudRepository} from "../../../repositories/bases/timestamped-crud-repository";


/**
 * This function will parse a
 * {
    [itemId: string]: RequestItemCoreType
   }
 * from a handleRequestSync and give it's reply. This has to be done a lot, so there are a lot of variables in here to avoid
 * code duplication.
 * @param fieldname              | This is the field in the sphere like 'hubs' and it uses this to populate the reply and search the request
 * @param db                     | This is the repository of the model that describes this category. It is used to get new data from when the client does not know the data, and used to insert data to.
 * @param clientSource           | This is the parent of the category from the request. So if the field is hubs, the clientSource is a sphere sync request (thats where the fieldname comes from)
 * @param replySource            | This is the parent of where we're going to put the reply.
 */
export async function processSyncReply<T extends UpdatedAt>(
  fieldname: SyncCategory, db: TimestampedCrudRepository<any, any>,
  requestItems: any,
  replySource: any,
  role: ACCESS_ROLE,
  editPermissions: RolePermissions,
  updateClientItemCallback?: (replyAtPoint: any, clientItem: any,) => Promise<void>,
  ) {
  if (requestItems) {
    replySource[fieldname] = {};
    let requestItemIds = Object.keys(requestItems || {});
    for (let i = 0; i < requestItemIds.length; i++) {
      let itemId = requestItemIds[i];
      replySource[fieldname][itemId] = {};
      if (editPermissions[role] !== true) {
        replySource[fieldname][itemId].data = {status: "ACCESS_DENIED"};
        continue;
      }
      let item = requestItems[itemId];
      // update model in cloud.
      try {
        await db.updateById(itemId, item.data, {acceptTimes: true});
        replySource[fieldname][itemId].data = {status: "UPDATED_IN_CLOUD"};
      }
      catch (e) {
        replySource[fieldname][itemId].data = { status: "ERROR", error: {code: e?.statusCode ?? 0, msg: e} };
      }

      if (updateClientItemCallback) {
        await updateClientItemCallback(replySource[fieldname][itemId], item);
      }

    }
  }
}
