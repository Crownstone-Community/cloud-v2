// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {del, get, HttpErrors, param, post, put, requestBody} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {repository} from "@loopback/repository";
import {SphereRepository} from "../repositories/data/sphere.repository";
import {SphereItem} from "./support/SphereItem";
import {authorize} from "@loopback/authorization";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";
import {Dbs} from "../modules/containers/RepoContainer";
import {FingerprintV2} from "../models/fingerprint-v2.model";
import {SphereAccessUtil} from "../util/SphereAccessUtil";
import {TransformSessionManager} from "../modules/fingerprintTransform/TransformSessionManager";


export class Localization extends SphereItem {
  authorizationModelName = "Sphere"; // we use the sphere model name since the provided ID in the endpoint is the sphere ID. This is used for authorization.

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @repository(SphereRepository) protected sphereRepo: SphereRepository,
  ) {
    super();
  }

  @post('/sphere/{id}/transform')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async startTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.query.string('userDeviceType')   deviceType: string,       // this is the deviceId of DeviceInfo lib.
    @param.query.string('targetUserId')     targetUserId: string,
    @param.query.string('targetDeviceType') targetDeviceType: string, // this is the deviceId of DeviceInfo lib.
  ): Promise<string> {
    try {
      // create a transform session which can time out after 30 minutes.
      let sessionId = await TransformSessionManager.createNewSession(sphereId, userProfile[securityId], deviceType, targetUserId, targetDeviceType);
      return sessionId;
    }
    catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }

  @del('/sphere/{id}/transform/{transformId}')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async deleteTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.path.string('transformId')   transformId: string,
  ): Promise<void> {
    TransformSessionManager.killSession(transformId);
  }


  @post('/sphere/{id}/transform/{transformId}/join')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async joinSession(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.path.string('transformId')    transformId: string,
  ): Promise<void> {
    // this uploads the data for a user for the transform process.
    try {
      TransformSessionManager.joinSession(transformId, userProfile[securityId]);
    }
    catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }


  @post('/sphere/{id}/transform/{transformId}/finalize')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async finalizeTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.path.string('transformId')   transformId: string,
  ): Promise<{sessionId: uuid, fromDevice: string, toDevice: string, transform: TransformSet}[]> {
    // finalize will start calculating the transform and send the data over the SSE
    try {
      return TransformSessionManager.generateTransformSets(transformId);
    }
    catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }


  @get('/sphere/{id}/transform/{transformId}/result')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async getTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.path.string('transformId')   transformId: string
  ): Promise<{sessionId: uuid, fromDevice: string, toDevice: string, transform: TransformSet}[]> {
    // finalize will start calculating the transform and send the data over the SSE
    try {
      return TransformSessionManager.generateTransformSets(transformId);
    }
    catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }


  @post('/sphere/{id}/transform/{transformId}/collection')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async startCollection(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.path.string('transformId')    transformId: string,
  ): Promise<uuid> {
    // create a transform session which can time out after 30 minutes.
    let datasetId = TransformSessionManager.startDatasetCollection(transformId);
    return datasetId;
  }


  @post('/sphere/{id}/transform/{transformId}/collection/{collectionId}/data')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async addDataToCollection(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id')   sphereId: string,
    @param.path.string('transformId')    transformId: string,
    @param.path.string('collectionId')   collectionId: string,
    @requestBody({required: true}) measurementData: MeasurementMap
  ): Promise<void> {
    // this uploads the data for a user for the transform process.
    try {
      TransformSessionManager.finishedCollectingDataset(transformId, collectionId, userProfile[securityId], measurementData);
    }
    catch (err: any) {
      throw new HttpErrors.BadRequest(err.message);
    }
  }


  @post('/spheres/{id}/fingerprint')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async addFingerprint(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @requestBody({required: true}) fingerprintData: FingerprintV2
  ): Promise<FingerprintV2> {
    fingerprintData.sphereId = sphereId;
    return Dbs.fingerprintV2.create(fingerprintData);
  }

  @put('/spheres/{id}/fingerprint/{fingerprintId}')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async updateFingerprint(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @param.path.string('fingerprintId') fingerprintId: string,
    @requestBody({required: true}) fingerprintData: Partial<FingerprintV2>
  ): Promise<void> {
    fingerprintData.sphereId = sphereId;
    return Dbs.fingerprintV2.updateById(fingerprintId, fingerprintData);
  }



  @del('/spheres/{id}/fingerprint/{fingerprintId}')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async deleteFingerprint(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @param.path.string('fingerprintId') fingerprintId: string,
  ): Promise<void> {
    return Dbs.fingerprintV2.deleteById(fingerprintId);
  }


  @get('/fingerprints/')
  @authenticate(SecurityTypes.accessToken)
  async getFingerprints(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription
  ): Promise<FingerprintV2[]> {
    let sphereIds = await SphereAccessUtil.getSphereIdsForUser(userProfile[securityId], "guest");
    let result    = await Dbs.fingerprintV2.find({where:{sphereId: {inq: sphereIds}}});
    return result;
  }

}
