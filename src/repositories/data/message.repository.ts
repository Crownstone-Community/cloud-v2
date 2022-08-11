import {
  BelongsToAccessor,
  Getter,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  juggler,
  repository
} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereRepository } from "./sphere.repository";
import { Message } from "../../models/message.model";
import { Sphere } from "../../models/sphere.model";
import { User } from "../../models/user.model";
import { MessageState } from "../../models/messageSubModels/message-state.model";
import { UserRepository } from "../users/user.repository";
import { MessageStateRepository } from "./message-state.repository";
import {MessageUser} from "../../models/messageSubModels/message-user.model";
import {MessageUserRepository} from "./message-user.repository";
import {Dbs} from "../../modules/containers/RepoContainer";
import {HttpErrors} from "@loopback/rest";


export class MessageRepository extends TimestampedCrudRepository<Message,typeof Message.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly owner:  BelongsToAccessor<User,   typeof User.prototype.id>;

  public recipients: HasManyThroughRepositoryFactory<User, typeof User.prototype.id, MessageUser, typeof Message.prototype.id>;
  public delivered:  HasManyRepositoryFactory<MessageState,   typeof MessageState.prototype.id>;
  public read:       HasManyRepositoryFactory<MessageState,   typeof MessageState.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository')      sphereRepoGetter:      Getter<SphereRepository>,
    @repository.getter('UserRepository')        userRepoGetter:        Getter<UserRepository>,
    @repository.getter('MessageUserRepository') messageUserRepoGetter: Getter<MessageUserRepository>,
    @repository(MessageStateRepository) protected messageStateRepo: MessageStateRepository,
    ) {
    super(Message, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.owner  = this.createBelongsToAccessorFor('owner',  userRepoGetter);

    this.recipients = this.createHasManyThroughRepositoryFactoryFor('recipients', userRepoGetter, messageUserRepoGetter);
    this.delivered  = this.createHasManyRepositoryFactoryFor('delivered', async () => messageStateRepo);
    this.read       = this.createHasManyRepositoryFactoryFor('read',      async () => messageStateRepo);
  }


  async addRecipient(messageId: string, userId: string) {
    let message     = await this.findById(messageId)
    let sphereUsers = await Dbs.sphere.users(message.sphereId).find({where:{id:userId}, fields:{id:true}})

    if (sphereUsers.length == 0) {
      throw new HttpErrors.NotFound(`User with id ${userId} not found in sphere with id ${message.sphereId}`);
    }

    await Dbs.messageUser.create({
      userId: userId,
      messageId: message.id,
      sphereId: message.sphereId,
    });
  }
}
