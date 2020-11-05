import {securityId, UserProfile} from "@loopback/security";
const TokenStrategy = require('passport-accesstoken').Strategy;
import {Strategy} from 'passport';
import {UserProfileFactory} from "@loopback/authentication";
import {Hub} from "../../../models/hub.model";
import {User} from "../../../models/user.model";
import {UserRepository} from "../../../repositories/users/user.repository";
import {HubRepository} from "../../../repositories/users/hub.repository";
import {CrownstoneTokenRepository} from "../../../repositories/users/crownstone-token.repository";
import {CrownstoneToken} from "../../../models/crownstone-token.model";



var strategyOptions = {
  tokenHeader:    'Authorization',
  tokenField:     'access_token'
};

type TokenPrincipalType = 'user' | 'hub'
interface TokenData {
  data:  User  | Hub,
  type: TokenPrincipalType
}

export function generateTokenStrategy(userRepo : UserRepository, hubRepo: HubRepository, crownstoneTokenRepo : CrownstoneTokenRepository) : Strategy {
  return new TokenStrategy(
    strategyOptions,
    async function (token : string, done: (err: any, user?: any) => void) : Promise<void> {
      let crownstoneToken : CrownstoneToken;
      try {
        crownstoneToken = await crownstoneTokenRepo.findById(token);
      }
      catch (err) {
        return done(err);
      }

      if (crownstoneToken.ttl > 0 && Date.now() < crownstoneToken.created.valueOf() + 1000*crownstoneToken.ttl) {
        // valid token!
        try {
          let item : TokenData = { data: null, type: crownstoneToken.principalType.toLowerCase() as TokenPrincipalType };
          if (item.type === 'hub') {
            item.data = await hubRepo.findById(crownstoneToken.userId);
          } else {
            item.data = await userRepo.findById(crownstoneToken.userId);
          }
          return done(null, item);
        }
        catch (err) {
          return done(err);
        }
      }
      else {
        // expired token
        return done(null, false);
      }
    }
  )
}


export function generateUserProfileFactory() : UserProfileFactory<TokenData> {
  const userProfileFactory: UserProfileFactory<TokenData> = (tokenData: TokenData) : UserProfile => {
    return {
      [securityId]: tokenData.data.id,
      userType: tokenData.type
    };
  }

  return userProfileFactory;
}
