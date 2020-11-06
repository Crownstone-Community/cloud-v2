import {Dbs} from "../containers/RepoContainer";
import {HttpErrors} from "@loopback/rest";

class Syncer {

  async downloadAll(userId: string) {
    let user   = await Dbs.user.findById(userId);
    let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});

    let sphereIds = [];

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
    }

    let sphereData = await Dbs.sphere.find({
      where: {id: {inq: sphereIds }},
      include: [
        {relation:'features'},
        {relation:'locations', scope: {
          include: [
            {relation: 'sphereOverviewPosition'}
          ]}
        },
        {relation:'messages'},
        {relation:'hubs'},
        {relation:'scenes'},
        {relation:'sortedLists'},
        {relation:'stones', scope: {
          include: [
            {relation: 'behaviours'},
            {relation: 'abilities', scope: {include:[{relation:'properties'}]}},
            {relation: 'currentSwitchState'},
            {relation: 'location', scope: {fields: {id:true, name: true} }}
          ]}
        },
        {relation:'trackingNumbers'},
        {relation:'toons'},
      ]
    });

    console.log(sphereData, user)


  }
  /**
   * This method will receive the initial sync request payload.
   *
   *
   * @param userId
   * @param dataStructure
   */
  async requestPhase(userId: string, dataStructure: SyncRequest) : Promise<any> {
    if (!dataStructure || Object.keys(dataStructure).length === 0 || true) {
      return this.downloadAll(userId)
    }
    // let syncData = dataStructure.sync;
    let userSync = dataStructure.user;
    if (!userSync) {
      throw new HttpErrors.BadRequest("User entry required.");
    }



    // if (dataStructure)
    // let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});



  }

  async replyPhase(userId: string) {

  }

}


export const SyncHandler = new Syncer();