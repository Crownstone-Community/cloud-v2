// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {get, post, requestBody, SchemaObject} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {UserService} from "../services";
import {User} from "../models/user.model";
import {UserRepository} from "../repositories/users/user.repository";
import {repository} from "@loopback/repository";
import {SyncHandler} from "../modules/sync/SyncHandler";
import {SyncRequestReply} from "../declarations/syncTypes";


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
    @repository(UserRepository) protected userRepo: UserRepository,
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {}


  @post('/user/login')
  async login(@requestBody(CredentialsRequestBody) credentials: Credentials) : Promise<CrownstoneToken> {
    return await this.userService.verifyCredentials(credentials);
  }

  @get('/user/')
  @authenticate(SecurityTypes.accessToken)
  async getUser(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<User> {
    return await this.userRepo.findById(userProfile[securityId])
  }

  // returns a list of our objects
  @post('/user/sync')
  @authenticate(SecurityTypes.accessToken)
  async sync(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({required: true}) syncData: any
  ): Promise<SyncRequestReply> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData)
    return result
  }

}
