import {
  BelongsToAccessor,
  Getter,
  HasManyThroughRepositoryFactory,
  juggler,
  repository
} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereRepository } from "./sphere.repository";
import { Sphere } from "../../models/sphere.model";
import { User } from "../../models/user.model";
import { UserRepository } from "../users/user.repository";
import {MessageV2} from "../../models/messageV2.model";
import {MessageRecipientUser} from "../../models/messageSubModels/message-recipient-user.model";
import {MessageReadByUser} from "../../models/messageSubModels/message-readBy-user.model";
import {MessageDeletedByUser} from "../../models/messageSubModels/message-deletedBy-user.model";
import {MessageRecipientUserRepository} from "./message-recipient-user.repository";
import {MessageDeletedByUserRepository} from "./message-deletedBy-user.repository";
import {MessageReadByUserRepository} from "./message-readBy-user.repository";


export class MessageV2Repository extends TimestampedCrudRepository<MessageV2,typeof MessageV2.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly owner:  BelongsToAccessor<User,   typeof User.prototype.id>;

  public recipients: HasManyThroughRepositoryFactory<User, typeof User.prototype.id, MessageRecipientUser, typeof MessageV2.prototype.id>;
  public deletedBy:  HasManyThroughRepositoryFactory<User, typeof User.prototype.id, MessageDeletedByUser, typeof MessageV2.prototype.id>;
  public readBy:     HasManyThroughRepositoryFactory<User, typeof User.prototype.id, MessageReadByUser,    typeof MessageV2.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository')               sphereRepoGetter:               Getter<SphereRepository>,
    @repository.getter('UserRepository')                 userRepoGetter:                 Getter<UserRepository>,
    @repository.getter('MessageRecipientUserRepository') messageRecipientUserRepoGetter: Getter<MessageRecipientUserRepository>,
    @repository.getter('MessageDeletedByUserRepository') messageDeletedByUserRepoGetter: Getter<MessageDeletedByUserRepository>,
    @repository.getter('MessageReadByUserRepository')    messageReadByUserGetter:        Getter<MessageReadByUserRepository>,
    ) {
    super(MessageV2, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.owner  = this.createBelongsToAccessorFor('owner',  userRepoGetter);

    this.recipients = this.createHasManyThroughRepositoryFactoryFor('recipients', userRepoGetter, messageRecipientUserRepoGetter);
    this.deletedBy  = this.createHasManyThroughRepositoryFactoryFor('deletedBy',  userRepoGetter, messageDeletedByUserRepoGetter);
    this.readBy     = this.createHasManyThroughRepositoryFactoryFor('readBy',     userRepoGetter, messageReadByUserGetter);
  }

}
