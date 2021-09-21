import {Dbs} from "../modules/containers/RepoContainer";


export const SphereAccessUtil = {
  getSphereUsers: async function(sphereIds: string[]) : Promise<{ [sphereId: string]: SphereUsers }> {
    let result : {[sphereId: string]: SphereUsers} = {};
    for (let sphereId of sphereIds) {
      result[sphereId] = await SphereAccessUtil.getSphereUsersForSphere(sphereId);
    }
    return result;
  },

  getSphereUsersForSphere: async function(sphereId: string) : Promise<SphereUsers> {
    let entries = await Dbs.sphereAccess.find({where:{sphereId}}, {fields:{invitePending: true, sphereId: true, userId: true, role: true, updatedAt: true}});
    let userIds = [];
    for (let entry of entries) {
      if (entry.role !== "hub") {
        userIds.push(entry.userId);
      }
    }
    let users = await Dbs.user.find({
      where:  {id: {inq: userIds}},
      fields: {id:true, firstName: true, lastName: true, email: true, profilePicId: true, language: true, updatedAt: true}
    });

    let result : SphereUsers = {};
    function getUser(userId: string) {
      for (let user of users) {
        if (user.id === userId) {
          return user;
        }
      }
      return null;
    }
    for (let entry of entries) {
      let userData = getUser(entry.userId);
      if (userData) {
        result[entry.userId] = {
          ...userData,
          invitePending: entry.invitePending,
          accessLevel: entry.role as ACCESS_ROLE,
          // pick the most recent update-at time between the sphere access model and the user model so that the sync
          // can account for permission changes, user model changes, invitation changes etc.
          updatedAt: new Date(Math.max(new Date(userData.updatedAt).valueOf(), new Date(entry.updatedAt).valueOf()))
        };
      }
    }

    return result;
  },
}