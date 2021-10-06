// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {param, post, requestBody} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {SyncHandler} from "../modules/sync/SyncHandler";
import {SyncRequestResponse} from "../declarations/syncTypes";



/**
 * This controller will echo the state of the hub.
 */
export class SphereController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {}

  // Perform a sync operation within a sphere
  @post('/spheres/{id}/sync')
  @authenticate(SecurityTypes.accessToken)
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData, {spheres:[id]})
    return result;
  }

}
