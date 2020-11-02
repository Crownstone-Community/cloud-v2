// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, UserProfile} from "@loopback/security";
import {get} from "@loopback/openapi-v3";
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";

/**
 * This controller will echo the state of the hub.
 */
export class UserController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
  ) {}


  // returns a list of our objects
  @get('/users/sync')
  @authenticate(SecurityTypes.accessToken)
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ): Promise<boolean> {
    return true
  }

}
