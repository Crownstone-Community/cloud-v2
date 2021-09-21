import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base_Custom} from "./Sync_Base_Custom";
import {getReply} from "../helpers/ReplyHelpers";


export class Sync_SphereUsers extends Sync_Base_Custom {

  fieldName : DataCategory = "users";
  db = Dbs.sphereAccess;
  writePermissions = {}
  editPermissions  = {}

  async processRequest(cloud_data : any = {}) {
    let proposedSphereUsers : SphereUserRequestContent = this.requestSphere[this.fieldName] ?? {};

    this.replySphere[this.fieldName] = {}

    // this checks the state of the users the client has
    for (let userId in proposedSphereUsers) {
      this.replySphere[this.fieldName][userId] = {data: await getReply(proposedSphereUsers[userId], cloud_data[userId], () => { return cloud_data[userId] })}

      // changes are not handled here. Sphere users' truth is in the cloud. Changes are handled by calling the corresponding endpoints, not sync.
      if (this.replySphere[this.fieldName][userId].data.status === "REQUEST_DATA") {
        this.replySphere[this.fieldName][userId].data.status = "IN_SYNC";
        delete this.replySphere[this.fieldName][userId].data.data;
      }
    }

    // this gets the users the client does not have.
    for (let userId in cloud_data) {
      if (proposedSphereUsers[userId] === undefined) {
        this.replySphere[this.fieldName][userId] = {data: await getReply(proposedSphereUsers[userId], cloud_data[userId], () => { return cloud_data[userId] })}
      }
    }
  }
}
