import {repository} from "@loopback/repository";
import {UserRepository} from "../repositories/users/user.repository";
import {CrownstoneTokenRepository} from "../repositories/users/crownstone-token.repository";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {HttpErrors} from "@loopback/rest";

let bcrypt = require("bcrypt")

const TTL = 14*24*3600 // 2 weeks in seconds;

export class UserService {
  constructor(
    @repository(UserRepository)            public userRepository: UserRepository,
    @repository(CrownstoneTokenRepository) public tokenRepository: CrownstoneTokenRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<CrownstoneToken> {
    if (!credentials)          { throw new HttpErrors.Unauthorized(); }
    if (!credentials.email)    { throw new HttpErrors.Unauthorized(); }
    if (!credentials.password) { throw new HttpErrors.Unauthorized(); }

    const foundUser = await this.userRepository.findOne({where: {email: credentials.email}}, {fields:{id: true, password:true}});
    if (!foundUser) {
      throw new HttpErrors.Unauthorized("Invalid username/password");
    }

    let success = await bcrypt.compare(credentials.password, foundUser.password)
    if (foundUser.password && success) {
      return await this.tokenRepository.create({
        userId: foundUser.id,
        principalType: 'user',
        ttl: TTL,
        expiredAt: new Date(Date.now()+TTL*1000)
      })
    }

    throw new HttpErrors.Unauthorized("Invalid username/password");
  }

}


