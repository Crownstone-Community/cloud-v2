// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, UserProfile} from "@loopback/security";
import {get, post, requestBody, SchemaObject} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {UserService} from "../services";


const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};



/**
 * This controller will echo the state of the hub.
 */
export class UserController {
  constructor(
    @inject("UserService") public userService: UserService,
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {}


  @post('/users/login')
  async login(@requestBody(CredentialsRequestBody) credentials: Credentials) : Promise<CrownstoneToken> {
    return await this.userService.verifyCredentials(credentials);
  }

  // returns a list of our objects
  @get('/users/sync')
  @authenticate(SecurityTypes.accessToken)
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ): Promise<boolean> {
    console.log("Sync request")
    return true
  }

}
