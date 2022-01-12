import {repository} from "@loopback/repository";
import {CrownstoneTokenRepository} from "../repositories/users/crownstone-token.repository";
import {CrownstoneToken} from "../models/crownstone-token.model";
import {HttpErrors} from "@loopback/rest";
import {HubRepository} from "../repositories/users/hub.repository";

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
          principalType: 'Hub'
        });
      }
      throw new HttpErrors.Unauthorized("Invalid username/password");
    }
    catch (err) {
      throw new HttpErrors.Unauthorized("Invalid username/password");
    }
  }

}


