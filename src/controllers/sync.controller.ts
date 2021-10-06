// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {get, post, requestBody, SchemaObject} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {SyncHandler} from "../modules/sync/SyncHandler";
import {SyncRequestResponse} from "../declarations/syncTypes";



/**
 * This controller will echo the state of the hub.
 */
export class SyncController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {}

  // Perform a sync operation
  @post('/sync')
  @authenticate(SecurityTypes.accessToken)
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData)
    return result;
  }

}
