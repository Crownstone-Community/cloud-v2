import {
  BelongsToAccessor,
  Getter, HasManyRepositoryFactory,
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
import {Dbs} from "../../modules/containers/RepoContainer";
import {HttpErrors} from "@loopback/rest";
import {DataObject, Options} from "@loopback/repository/src/common-types";


export class MessageV2Repository extends TimestampedCrudRepository<MessageV2,typeof MessageV2.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly owner:  BelongsToAccessor<User,   typeof User.prototype.id>;

  public recipients: HasManyRepositoryFactory<MessageRecipientUser, typeof MessageRecipientUser.prototype.id>;
  public deletedBy:  HasManyRepositoryFactory<MessageDeletedByUser, typeof MessageDeletedByUser.prototype.id>;
  public readBy:     HasManyRepositoryFactory<MessageReadByUser,    typeof MessageReadByUser.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository')               sphereRepoGetter:               Getter<SphereRepository>,
    @repository.getter('UserRepository')                 userRepoGetter:                 Getter<UserRepository>,
    @repository('MessageRecipientUserRepository') messageRecipientUserRepo: MessageRecipientUserRepository,
    @repository('MessageDeletedByUserRepository') messageDeletedByUserRepo: MessageDeletedByUserRepository,
    @repository('MessageReadByUserRepository')    messageReadByUser:        MessageReadByUserRepository,
    ) {
    super(MessageV2, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.owner  = this.createBelongsToAccessorFor('owner',  userRepoGetter);

    this.recipients = this.createHasManyRepositoryFactoryFor('recipients', async () => messageRecipientUserRepo);
    this.deletedBy  = this.createHasManyRepositoryFactoryFor('deletedBy',  async () => messageDeletedByUserRepo);
    this.readBy     = this.createHasManyRepositoryFactoryFor('readBy',     async () => messageReadByUser);

    this.registerInclusionResolver('recipients', this.recipients.inclusionResolver);
    this.registerInclusionResolver('deletedBy',  this.deletedBy.inclusionResolver);
    this.registerInclusionResolver('readBy',     this.readBy.inclusionResolver);
  }

  async create(entity: DataObject<MessageV2>, options?: Options): Promise<MessageV2> {
    let recipients = entity.recipients;
    delete entity.recipients;

    let newMessage = await super.create(entity, options);

    if (recipients) {
      for (let recipient of recipients) {
        await this.addRecipient(newMessage.sphereId, newMessage.id, recipient as any);
      }
    }

    return newMessage
  }


  async addRecipient(sphereId: string, messageId: string, userId: string) : Promise<MessageRecipientUser>{
    let sphereUsers = await Dbs.sphere.users(sphereId).find({where:{id:userId}, fields:{id:true}})

    if (sphereUsers.length == 0) {
      throw new HttpErrors.NotFound(`User with id ${userId} not found in sphere with id ${sphereId}`);
    }

    return await Dbs.messageRecipientUser.create({
      userId:    userId,
      messageId: messageId,
      sphereId:  sphereId,
    });
  }

  async markAsRead(sphereId: string, messageId: string, userId: string) : Promise<MessageReadByUser> {
    let alreadyExisting = await Dbs.messageReadByUser.findOne({where:{userId:userId, messageId:messageId}, fields:{id:true}});
    if (alreadyExisting !== null) {
      // already existing, do nothing
      return;
    }

    let sphereUsers = await Dbs.sphere.users(sphereId).find({where:{id:userId}, fields:{id:true}})
    if (sphereUsers.length == 0) {
      throw new HttpErrors.NotFound(`User with id ${userId} not found in sphere with id ${sphereId}`);
    }

    return await Dbs.messageReadByUser.create({
      userId:    userId,
      messageId: messageId,
      sphereId:  sphereId,
    });
  }

  async markAsDeleted(sphereId: string, messageId: string, userId: string) : Promise<MessageDeletedByUser>  {
    let alreadyExisting = await Dbs.messageDeletedByUser.findOne({where:{userId:userId, messageId:messageId}, fields:{id:true}});
    if (alreadyExisting !== null) {
      // already existing, do nothing
      return;
    }

    let sphereUsers = await Dbs.sphere.users(sphereId).find({where:{id:userId}, fields:{id:true}})
    if (sphereUsers.length == 0) {
      throw new HttpErrors.NotFound(`User with id ${userId} not found in sphere with id ${sphereId}`);
    }

    return await Dbs.messageDeletedByUser.create({
      userId:    userId,
      messageId: messageId,
      sphereId:  sphereId,
    });
  }

  async deleteById(id: any, options?: Options): Promise<void> {
    await Dbs.messageRecipientUser.deleteAll({messageId: id});
    await Dbs.messageReadByUser.deleteAll({messageId: id});
    await Dbs.messageDeletedByUser.deleteAll({messageId: id});

    return super.deleteById(id, options);
  }
}
