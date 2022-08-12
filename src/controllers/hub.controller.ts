// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
import {inject} from "@loopback/context";
import {SecurityBindings, UserProfile} from "@loopback/security";
import {param, post} from '@loopback/rest';
import {CrownstoneToken} from "../models/crownstone-token.model";
import {HubService} from "../services";
import {repository} from "@loopback/repository";
import {HubRepository} from "../repositories/users/hub.repository";

/**
 * This controller will echo the state of the hub.
 */
export class HubEndpoints {
  constructor(
    @inject("HubService") public hubService: HubService,
    @repository(HubRepository) protected userRepo: HubRepository,
    @inject(SecurityBindings.USER, {optional: true}) public user: UserProfile,
  ) {}


  @post('/hub/{id}/login')
  async login(
    @param.path.string('id', {required:true}) id: string,
    @param.query.string('token', {required:true}) token: string,
  ) : Promise<CrownstoneToken> {
    return await this.hubService.verifyCredentials(id, token);
  }

}
