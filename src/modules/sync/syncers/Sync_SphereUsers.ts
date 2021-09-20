import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base_Custom} from "./Sync_Base_Custom";
import {getReply} from "../helpers/ReplyHelpers";


export class Sync_SphereUsers extends Sync_Base_Custom {

  fieldName : DataCategory = "users";
  db = Dbs.sphereAccess;
  writePermissions = {}
  editPermissions  = {}

  async processRequest(cloud_data : any = {}) {
    let proposedSphereUsers : SphereUsers = this.requestSphere[this.fieldName];

    this.replySphere[this.fieldName] = {}

    await this._processSegment(cloud_data, proposedSphereUsers ?? {}, 'admin')
    await this._processSegment(cloud_data, proposedSphereUsers ?? {}, 'member')
    await this._processSegment(cloud_data, proposedSphereUsers ?? {}, 'basic')
  }

  async _processSegment(cloud_data : any, requestSphereUsers: SphereUsersOptional, segment : "admin" | "member" | "basic") {
    let providedUsers = requestSphereUsers[segment] ?? {};
    let cloudData     = cloud_data[segment]         ?? {};

    this.replySphere[this.fieldName][segment] = {}

    // this checks the state of the users the client has
    for (let userId in providedUsers) {
      this.replySphere[this.fieldName][segment][userId] = {data: await getReply(providedUsers[userId], cloudData[userId], () => { return Dbs.user.findById(userId); })}
      if (this.replySphere[this.fieldName][segment][userId].data.status === "REQUEST_DATA") {
        this.replySphere[this.fieldName][segment][userId].data.status = "IN_SYNC";
        delete this.replySphere[this.fieldName][segment][userId].data.data;
      }
    }

    // this gets the users the client does not have.
    for (let userId in cloudData) {
      if (providedUsers[userId] === undefined) {
        this.replySphere[this.fieldName][segment][userId] = {data: await getReply(providedUsers[userId], cloudData[userId], () => { return Dbs.user.findById(userId); })}
      }
    }
  }
}
