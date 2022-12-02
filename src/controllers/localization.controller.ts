// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {del, get, getModelSchemaRef, param, post, put, requestBody} from '@loopback/rest';
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



export class Localization extends SphereItem {
  authorizationModelName = "Sphere"; // we use the sphere model name since the provided ID in the endpoint is the sphere ID. This is used for authorization.

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @repository(SphereRepository) protected sphereRepo: SphereRepository,
  ) {
    super();
  }

  @post('/transform/request')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async startTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('userDeviceType')   deviceType: string,    // this is the deviceId of DeviceInfo lib.
    @param.path.string('targetUserId')     targetUserId: string,
    @param.path.string('targetDeviceType') targetDeviceType: string,
  ): Promise<string> {
    // create a transform session which can time out after 30 minutes.

    // flow:
    // tell other user to open the app
    // start the transform request
    // wait for the other user to accept the request
    // start the transform process.
    // users gather data and post it


    return "UUID";
  }

  @post('/transform/data')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async transformData(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('userDeviceType') deviceType: string,
    @param.path.string('transformId')    transformId: string,
    @requestBody({required: true}) measurementData: any[]
  ): Promise<void> {
    // this uploads the data for a user for the transform process.
  }


  @post('/transform/finalize')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async finalizeTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('userDeviceType')   deviceType: string,
    @requestBody({required: true}) measurementData: any[]
  ): Promise<void> {
    // finalize will start calculating the transform and send the data over the SSE
  }



  @get('/transform/result')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereMember())
  async getTransform(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('deviceA')   deviceTypeA: string,
    @param.path.string('deviceB')   deviceTypeB: string,
    @requestBody({required: true}) measurementData: any[]
  ): Promise<void> {
    // get the transform data
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
