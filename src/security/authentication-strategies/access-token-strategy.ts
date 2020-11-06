import {AuthenticationStrategy} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {Request} from "express-serve-static-core";
import {StrategyAdapter} from "@loopback/authentication-passport";
import {repository} from "@loopback/repository";
import {generateTokenStrategy, generateUserProfileFactory} from "./passport/token-strategy";
import {CrownstoneTokenRepository} from "../../repositories/users/crownstone-token.repository";
import {UserRepository} from "../../repositories/users/user.repository";
import {HubRepository} from "../../repositories/users/hub.repository";
import {SphereAccessRepository} from "../../repositories/data/sphere-access.repository";
import {HttpErrors} from "@loopback/rest";


export interface UserProfileDescription {
  [securityId] : string,
}


export class AccessTokenStrategy implements AuthenticationStrategy {
  name = 'AccessToken';

  accessTokenCheck: any

  constructor(
    @repository(CrownstoneTokenRepository) protected csTokenRepo: CrownstoneTokenRepository,
    @repository(UserRepository) protected userRepo: UserRepository,
    @repository(HubRepository) protected hubRepo: HubRepository,
    @repository(SphereAccessRepository) protected sphereAccessRepo: SphereAccessRepository,
  ) {
    this.accessTokenCheck = new StrategyAdapter(
      generateTokenStrategy(userRepo, hubRepo, csTokenRepo),
      'AccessToken',
      generateUserProfileFactory());
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    try {
      let userProfile = await this.accessTokenCheck.authenticate(request);
      return userProfile;
    }
    catch (e) {
      if (e instanceof HttpErrors) {
        throw e;
      }
      throw new HttpErrors.Unauthorized("Unauthorized")
    }
  }


}
