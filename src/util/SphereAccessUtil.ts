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
    let result = {
      admin:  await SphereAccessUtil.getSphereUsersForSpherePerRole(sphereId, 'admin'),
      member: await SphereAccessUtil.getSphereUsersForSpherePerRole(sphereId, 'member'),
      basic:  await SphereAccessUtil.getSphereUsersForSpherePerRole(sphereId, 'guest'),
    }
    return result;
  },


  getSphereUsersForSpherePerRole: async function(sphereId: string, role: ACCESS_ROLE) : Promise<SphereUserContent> {
    let entries = await Dbs.sphereAccess.find({where:{and:[{sphereId}, {role}]}});
    let userIds = [];
    for (let entry of entries) {
      userIds.push(entry.userId);
    }
    let users = await Dbs.user.find({
      where:  {id: {inq: userIds}},
      fields: {id:true, firstName: true, lastName: true, email: true, profilePicId: true}
    });

    let result : SphereUserContent = {};
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
        result[entry.userId] = {data: userData, invitePending: entry.invitePending};
      }
    }

    return result;
  },
}