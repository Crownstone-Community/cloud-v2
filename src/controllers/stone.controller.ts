// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {del, param, post, requestBody} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {authorize} from "@loopback/authorization";
import {SphereItem} from "./support/SphereItem";
import {Authorization} from "../security/authorization-strategies/authorization-sphere";



/**
 * This controller will echo the state of the hub.
 */
export class Stones extends SphereItem {
  authorizationModelName = "Stone";

  constructor(
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {
    super();
  }



  // Delete a stone
  @del('/stones/{id}')
  @authenticate(SecurityTypes.accessToken)
  @authorize(Authorization.sphereAdmin())
  async deleteStone(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<string> {
    return "Not implemented yet."
  }

}
