import {Dbs} from "../modules/containers/RepoContainer";
import {AccessLevels} from "../models/sphere-access.model";


export const SphereAccessUtil = {
  getSphereUsers: async function(sphereIds: string[]) : Promise<{ [sphereId: string]: SphereUsers }> {
    let result : {[sphereId: string]: SphereUsers} = {};
    for (let sphereId of sphereIds) {
      result[sphereId] = await SphereAccessUtil.getSphereUsersForSphere(sphereId);
    }
    return result;
  },



  /** get access level for spheres where the role is the maximum of the access levels of the spheres */
  getAccessLevelArray(role: ACCESS_ROLE) : string[]{
    switch (role) {
      case 'admin':
        return [AccessLevels.admin];
      case 'member':
        return [AccessLevels.admin, AccessLevels.member];
      case 'guest':
        return [AccessLevels.admin, AccessLevels.member, AccessLevels.guest];
    }
    return [];
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
        if (user.id == userId) {
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
          updatedAt: new Date(Math.max(new Date(userData.updatedAt ?? 0).valueOf(), new Date(entry.updatedAt ?? 0).valueOf()))
        };
      }
    }
    return result;
  },

  getSphereIdsForUser: async function(userId: string, accessLevel: ACCESS_ROLE = 'guest') : Promise<string[]> {
    let sphereAccess = await Dbs.sphereAccess.find({where:{and: [{userId}, {role:{inq:SphereAccessUtil.getAccessLevelArray(accessLevel) }}]}}, {fields:{sphereId: true}});
    let sphereIds = [];
    for (let entry of sphereAccess) {
      sphereIds.push(entry.sphereId);
    }
    return sphereIds;
  }
}
