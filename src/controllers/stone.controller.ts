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
import {authorize} from "@loopback/authorization";
import {SphereItem} from "./support/SphereItem";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";



/**
 * This controller will echo the state of the hub.
 */
export class StoneController extends SphereItem {
  modelName = "Stone";

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {
    super();
  }

  // Perform a sync operation within a sphere
  @post('/stones/{id}/sync')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAccess())
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData, {stones:[id]})
    return result;
  }

}
