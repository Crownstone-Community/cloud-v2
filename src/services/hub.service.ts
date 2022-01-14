import {repository} from "@loopback/repository";
import {CrownstoneTokenRepository} from "../repositories/users/crownstone-token.repository";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {HttpErrors} from "@loopback/rest";
import {HubRepository} from "../repositories/users/hub.repository";

const TTL = 14*24*3600 // 2 weeks in seconds;

export class HubService {
  constructor(
    @repository(HubRepository)             public hubRepository: HubRepository,
    @repository(CrownstoneTokenRepository) public tokenRepository: CrownstoneTokenRepository,
  ) {}

  async verifyCredentials(id: string, token: string): Promise<CrownstoneToken> {
    if (!id)    { throw new HttpErrors.Unauthorized(); }
    if (!token) { throw new HttpErrors.Unauthorized(); }

    try {
      const foundHub = await this.hubRepository.findById(id);
      if (!foundHub) {
        throw new HttpErrors.Unauthorized("Invalid Hub id/token");
      }

      if (foundHub.token === token) {
        return await this.tokenRepository.create({
          userId: foundHub.id,
          principalType: 'Hub',
          ttl: TTL,
          expiredAt: new Date(Date.now()+TTL*1000)
        });
      }
      throw new HttpErrors.Unauthorized("Invalid username/password");
    }
    catch (err) {
      throw new HttpErrors.Unauthorized("Invalid username/password");
    }
  }

}


