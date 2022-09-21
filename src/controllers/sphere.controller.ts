import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {get, param, post, requestBody} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {SyncHandler} from "../modules/sync/SyncHandler";
import {SyncRequestResponse} from "../declarations/syncTypes";
import {repository} from "@loopback/repository";
import {SphereRepository} from "../repositories/data/sphere.repository";
import {SphereItem} from "./support/SphereItem";
import {authorize} from "@loopback/authorization";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";
import {Dbs} from "../modules/containers/RepoContainer";
import {sphereFeatures} from "../enums";


export class Spheres extends SphereItem {
  authorizationModelName = "Sphere";

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
    @repository(SphereRepository) protected sphereRepo: SphereRepository,
  ) { super(); }

  // Perform a sync operation within a sphere
  @post('/spheres/{id}/sync')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAccess())
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData, {spheres:[sphereId]})
    return result;
  }

}
