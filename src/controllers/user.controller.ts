// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {get, HttpErrors, oas, post, requestBody, RestBindings, SchemaObject} from '@loopback/rest';
import {authenticate} from "@loopback/authentication";
import {UserProfileDescription} from "../security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "../config";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {UserService} from "../services";
import {User} from "../models/user.model";
import {UserRepository} from "../repositories/users/user.repository";
import {repository} from "@loopback/repository";
import {SyncHandler} from "../modules/sync/SyncHandler";
import {SyncRequestResponse} from "../declarations/syncTypes";
import {DataDownloader} from "../modules/gdpr/DataDownloader";
import {Response} from "express";


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
  ): Promise<SyncRequestResponse> {
    let result = await SyncHandler.handleSync(userProfile[securityId], syncData)
    return result;
  }

  @get('/user/allUserData')
  @authenticate(SecurityTypes.accessToken)
  @oas.response.file()
  async downloadAllData(
    @inject(SecurityBindings.USER)      userProfile : UserProfileDescription,
    @inject(RestBindings.Http.RESPONSE) response:     Response,
  ) : Promise<any> {
    try {
      let fileBuffer = await new DataDownloader(userProfile[securityId]).download();
      response.header('Content-Disposition', `attachment; filename=Crownstone_user_data.zip`)
      response.header('Content-Type',        `application/zip`)
      response.end(fileBuffer)
    }
    catch (err) {
      console.error("Error downloading user data", err)
      return new HttpErrors.InternalServerError()
    }
  }

}
