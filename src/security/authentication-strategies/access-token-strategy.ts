import {AuthenticationStrategy} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {Request} from "express-serve-static-core";
import {StrategyAdapter} from "@loopback/authentication-passport";
import {repository} from "@loopback/repository";
import {generateTokenStrategy, generateUserProfileFactory} from "./passport/token-strategy";
import {CrownstoneTokenRepository, HubRepository, SphereAccessRepository, UserRepository} from "../../repositories";


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
      generateTokenStrategy(csTokenRepo),
      'AccessToken',
      generateUserProfileFactory(userRepo, hubRepo, sphereAccessRepo));
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let user = await this.accessTokenCheck.authenticate(request);
    console.log("SUCCeSS", user)
    // if (!api_key) {
    //   throw new HttpErrors.Unauthorized(`Api key not found.`);
    // }
    // api_key = api_key.replace("Bearer ",'');
    // let user = await this.userService.checkApiKey(api_key as string)
    //
    let userProfile : UserProfileDescription = {
      [securityId]: '1232',
    }
    return userProfile;
  }


}
