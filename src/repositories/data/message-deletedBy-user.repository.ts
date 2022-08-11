import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {Sphere} from "../../models/sphere.model";
import {User} from "../../models/user.model";
import {UserRepository} from "../users/user.repository";
import {MessageV2} from "../../models/messageV2.model";
import {MessageV2Repository} from "./messageV2.repository";
import {MessageDeletedByUser} from "../../models/messageSubModels/message-deletedBy-user.model";


export class MessageDeletedByUserRepository extends TimestampedCrudRepository<MessageDeletedByUser,typeof MessageDeletedByUser.prototype.id > {
  public readonly sphere:  BelongsToAccessor<Sphere,  typeof Sphere.prototype.id>;
  public readonly message: BelongsToAccessor<MessageV2, typeof MessageV2.prototype.id>;
  public readonly user:   BelongsToAccessor<User,    typeof User.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('MessageRepository') messageRepoGetter: Getter<MessageV2Repository>,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>) {
    super(MessageDeletedByUser, datasource);
    this.sphere  = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.message = this.createBelongsToAccessorFor('message', messageRepoGetter);
    this.user    = this.createBelongsToAccessorFor('user', userRepoGetter);
  }
}
