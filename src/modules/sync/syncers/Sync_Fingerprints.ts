import {Dbs} from "../../containers/RepoContainer";
import {Sync_Base} from "./Sync_Base";
import {FingerprintV2} from "../../../models/fingerprint-v2.model";

export class Sync_Fingerprints extends Sync_Base<FingerprintV2, RequestItemCoreType> {

  fieldName : SyncCategory = "fingerprints";
  db = Dbs.fingerprintV2;
  writePermissions = {admin: true, member: true}
  editPermissions  = {admin: true, member: true}

  createEventCallback(clientFingerprint: RequestItemCoreType, cloudFingerprint: FingerprintV2) {
  }

  updateEventCallback(fingerprintId: string, cloudFingerprint: FingerprintV2) {
  }

}
