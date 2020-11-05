import {repository} from "@loopback/repository";
import {UserRepository} from "../repositories/users/user.repository";
import {CrownstoneTokenRepository} from "../repositories/users/crownstone-token.repository";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {HttpErrors} from "@loopback/rest";
import {CloudUtil} from "../util/CloudUtil";

export class UserService {
  constructor(
    @repository(UserRepository)            public userRepository: UserRepository,
    @repository(CrownstoneTokenRepository) public tokenRepository: CrownstoneTokenRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<CrownstoneToken> {
    if (!credentials)          { throw new HttpErrors.Unauthorized(); }
    if (!credentials.email)    { throw new HttpErrors.Unauthorized(); }
    if (!credentials.password) { throw new HttpErrors.Unauthorized(); }

    let hashedPassword = CloudUtil.hashPassword(credentials.password);
    const foundUser = await this.userRepository.findOne({where: {email: credentials.email, password: hashedPassword}}, {fields:{id: true}});
    if (!foundUser) {
      throw new HttpErrors.Unauthorized("Invalid username/password");
    }

    return await this.tokenRepository.create({userId: foundUser.id, principalType: 'user'})
  }

}


