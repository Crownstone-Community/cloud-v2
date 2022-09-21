// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {get, param, post, requestBody, SchemaObject} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {SyncHandler} from "../modules/sync/SyncHandler";
import {SyncRequestResponse} from "../declarations/syncTypes";
import {repository} from "@loopback/repository";
import {SphereRepository} from "../repositories/data/sphere.repository";
import {authorize} from "@loopback/authorization";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";



/**
 * This controller will echo the state of the hub.
 */
export class Sync {
  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {}

  // Perform a sync operation
  @post('/sync')
  @authenticate(SecurityTypes.accessToken)
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({required: true}) syncData: SyncRequest
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData)
    return result;
  }

  // Perform a sync operation within a sphere
  @post('/spheres/{id}/sync')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAccess("Sphere"))
  async syncSphere(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') sphereId: string,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData, {spheres:[sphereId]})
    return result;
  }

  // Perform a sync operation within a sphere
  @post('/stones/{id}/sync')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAccess('Stone'))
  async syncStone(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData, {stones:[id]})
    return result;
  }

}
