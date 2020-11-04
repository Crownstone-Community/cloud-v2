import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {MessageRepository} from "./message.repository";
import {MessageState} from "../../models/messageSubModels/message-state.model";
import {Sphere} from "../../models/sphere.model";
import {Message} from "../../models/message.model";
import {User} from "../../models/user.model";
import {UserRepository} from "../users/user.repository";


export class MessageStateRepository extends TimestampedCrudRepository<MessageState,typeof MessageState.prototype.id > {
  public readonly sphere:           BelongsToAccessor<Sphere,  typeof Sphere.prototype.id>;
  public readonly messageDelivered: BelongsToAccessor<Message, typeof Message.prototype.id>;
  public readonly messageRead:      BelongsToAccessor<Message, typeof Message.prototype.id>;
  public readonly users:            BelongsToAccessor<User,    typeof User.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>,
    @repository.getter('MessageRepository') messageRepositoryGetter: Getter<MessageRepository>,
    @repository.getter('UserRepository') userRepositoryGetter: Getter<UserRepository>) {
    super(MessageState, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepositoryGetter);
    this.messageDelivered = this.createBelongsToAccessorFor('messageDelivered', messageRepositoryGetter);
    this.messageRead = this.createBelongsToAccessorFor('messageRead', messageRepositoryGetter);
    this.users = this.createBelongsToAccessorFor('users', userRepositoryGetter);
  }
}
