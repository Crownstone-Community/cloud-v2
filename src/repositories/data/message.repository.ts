import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereRepository } from "./sphere.repository";
import {Message} from "../../models/message.model";
import {Sphere} from "../../models/sphere.model";
import {User} from "../../models/user.model";
import {MessageState} from "../../models/messageSubModels/message-state.model";
import {UserRepository} from "../users/user.repository";
import {MessageStateRepository} from "./message-state.repository";


export class MessageRepository extends TimestampedCrudRepository<Message,typeof Message.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly owner:  BelongsToAccessor<User,   typeof User.prototype.id>;

  public recipients: HasManyRepositoryFactory<User,           typeof User.prototype.id>;
  public delivered:  HasManyRepositoryFactory<MessageState,   typeof MessageState.prototype.id>;
  public read:       HasManyRepositoryFactory<MessageState,   typeof MessageState.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>,
    @repository.getter('UserRepository') userRepositoryGetter: Getter<UserRepository>,

    @repository(UserRepository)         protected userRepository: UserRepository,
    @repository(MessageStateRepository) protected messageStateRepository: MessageStateRepository,
    ) {
    super(Message, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepositoryGetter);
    this.owner  = this.createBelongsToAccessorFor('owner', userRepositoryGetter);

    this.recipients = this.createHasManyRepositoryFactoryFor('recipients',async () => userRepository);
    this.delivered  = this.createHasManyRepositoryFactoryFor('delivered', async () => messageStateRepository);
    this.read       = this.createHasManyRepositoryFactoryFor('read',  async () => messageStateRepository);

  }
}
