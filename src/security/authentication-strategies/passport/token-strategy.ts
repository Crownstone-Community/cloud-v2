import {securityId, UserProfile} from "@loopback/security";
const TokenStrategy = require('passport-accesstoken').Strategy;
import {Strategy} from 'passport';
import {UserProfileFactory} from "@loopback/authentication";
import {CrownstoneTokenRepository, HubRepository, SphereAccessRepository, UserRepository} from "../../../repositories";
import {CrownstoneTokenModel} from "../../../models";



var strategyOptions = {
  tokenHeader:    'Authorization',
  tokenField:     'access_token'
};

export function generateTokenStrategy(crownstoneTokenRepo : CrownstoneTokenRepository) : Strategy {
  return new TokenStrategy(
    strategyOptions,
    async function (token : string, done: (err: any, user?: any) => void) : Promise<void> {
      let crownstoneToken : CrownstoneTokenModel;
      try {
        crownstoneToken = await crownstoneTokenRepo.findById(token);
      }
      catch (err) {
        return done(err);
      }

      if (crownstoneToken.ttl > 0 && Date.now() < crownstoneToken.created.valueOf() + 1000*crownstoneToken.ttl) {
        return done(null, crownstoneToken);
      }
      else {
        // expired token
        return done(null, false);
      }
    }
  )
}


export function generateUserProfileFactory(userRepo : UserRepository, hubRepo: HubRepository, sphereAccessRepo: SphereAccessRepository) : UserProfileFactory<CrownstoneTokenModel> {
  const userProfileFactory: UserProfileFactory<CrownstoneTokenModel> = (crownstoneToken: CrownstoneTokenModel) : UserProfile => {

    return {
      [securityId]: 'gds'
    }
  }

  return userProfileFactory;
}
