import {
  BelongsToAccessor, Getter,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  juggler, repository
} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {Sphere} from "../../models/sphere.model";
import {Location} from "../../models/location.model";
import {Message} from "../../models/message.model";
import {Scene} from "../../models/scene.model";
import {Stone} from "../../models/stone.model";
import {User} from "../../models/user.model";
import {Hub} from "../../models/hub.model";
import {SortedList} from "../../models/sorted-list.model";
import {SphereFeature} from "../../models/sphere-feature.model";
import {Toon} from "../../models/toon.model";
import {SphereAccess} from "../../models/sphere-access.model";
import {LocationRepository} from "./location.repository";
import {UserRepository} from "../users/user.repository";
import {StoneRepository} from "./stone.repository";
import {SceneRepository} from "./scene.repository";
import {MessageRepository} from "./message.repository";
import {HubRepository} from "../users/hub.repository";
import {SortedListRepository} from "./sorted-list.repository";
import {SphereFeatureRepository} from "./sphere-feature.repository";
import {ToonRepository} from "./toon.repository";
import {SphereAccessRepository} from "./sphere-access.repository";
import {SphereTrackingNumber} from "../../models/sphere-tracking-number.model";
import {SphereTrackingNumberRepository} from "./sphere-tracking-number.repository";
import {SphereKeyRepository} from "./sphere-key.repository";
import {SphereKey} from "../../models/sphere-key.model";
import {CloudUtil} from "../../util/CloudUtil";
import * as crypto from "crypto";
import {keyTypes} from "../../enums";
import {HttpErrors} from "@loopback/rest";


export class SphereRepository extends TimestampedCrudRepository<Sphere,typeof Sphere.prototype.id > {
  public readonly owner: BelongsToAccessor<User, typeof User.prototype.id>;

  public stones:         HasManyRepositoryFactory<Stone,         typeof Stone.prototype.id>;
  public locations:      HasManyRepositoryFactory<Location,      typeof Location.prototype.id>;
  public scenes:         HasManyRepositoryFactory<Scene,         typeof Scene.prototype.id>;
  public messages:       HasManyRepositoryFactory<Message,       typeof Message.prototype.id>;
  public hubs:           HasManyRepositoryFactory<Hub,           typeof Hub.prototype.id>;
  public sortedLists:    HasManyRepositoryFactory<SortedList,    typeof SortedList.prototype.id>;
  public sphereFeatures: HasManyRepositoryFactory<SphereFeature, typeof SphereFeature.prototype.id>;
  public trackingNumbers: HasManyRepositoryFactory<SphereTrackingNumber, typeof SphereTrackingNumber.prototype.id>;
  public keys:           HasManyRepositoryFactory<SphereKey, typeof SphereKey.prototype.id>;
  public toons:          HasManyRepositoryFactory<Toon, typeof Toon.prototype.id>;
  public users:          HasManyThroughRepositoryFactory<User, typeof User.prototype.id, SphereAccess, typeof Sphere.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('UserRepository') ownerRepoGetter: Getter<UserRepository>,
    @repository.getter('SphereAccessRepository') sphereAccessRepoGetter: Getter<SphereAccessRepository>,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>,

    @repository(StoneRepository)         protected stoneRepo:         StoneRepository,
    @repository(LocationRepository)      protected locationRepo:      LocationRepository,
    @repository(SceneRepository)         protected sceneRepo:         SceneRepository,
    @repository(MessageRepository)       protected messageRepo:       MessageRepository,
    @repository(HubRepository)           protected hubRepo:           HubRepository,
    @repository(SortedListRepository)    protected sortedListRepo:    SortedListRepository,
    @repository(SphereFeatureRepository) protected sphereFeatureRepo: SphereFeatureRepository,
    @repository(SphereTrackingNumberRepository) protected sphereTrackingNumberRepo: SphereTrackingNumberRepository,
    @repository(SphereKeyRepository)     protected sphereKeyRepo:     SphereKeyRepository,
    @repository(ToonRepository)          protected toonRepo:          ToonRepository,
  ) {
    super(Sphere, datasource);
    this.owner           = this.createBelongsToAccessorFor('owner', ownerRepoGetter);
    this.users           = this.createHasManyThroughRepositoryFactoryFor('users', userRepoGetter, sphereAccessRepoGetter);

    this.stones          = this.createHasManyRepositoryFactoryFor('stones',     async () => stoneRepo);
    this.locations       = this.createHasManyRepositoryFactoryFor('locations',  async () => locationRepo);
    this.scenes          = this.createHasManyRepositoryFactoryFor('scenes',     async () => sceneRepo);
    this.messages        = this.createHasManyRepositoryFactoryFor('messages',   async () => messageRepo);
    this.keys            = this.createHasManyRepositoryFactoryFor('keys',       async () => sphereKeyRepo);
    this.hubs            = this.createHasManyRepositoryFactoryFor('hubs',       async () => hubRepo);
    this.sortedLists     = this.createHasManyRepositoryFactoryFor('sortedLists',async () => sortedListRepo);
    this.sphereFeatures  = this.createHasManyRepositoryFactoryFor('features',   async () => sphereFeatureRepo);
    this.trackingNumbers = this.createHasManyRepositoryFactoryFor('trackingNumbers',async () => sphereTrackingNumberRepo);
    this.toons           = this.createHasManyRepositoryFactoryFor('toons',      async () => toonRepo);
  }

  async create(entity: DataObject<Sphere>, options?: Options): Promise<Sphere> {
    if (!entity.uuid) {
      entity.uuid = CloudUtil.createIBeaconUUID();
    }
    if (!entity.uid) {
      entity.uid = crypto.randomBytes(1)[0]
    }
    if (!entity.ownerId) {
      throw new HttpErrors.BadRequest("OwnerId must be supplied.");
    }

    let sphere = await super.create(entity, options);

    await this.keys(sphere.id).create({keyType: keyTypes.ADMIN_KEY,            key: CloudUtil.createKey()});
    await this.keys(sphere.id).create({keyType: keyTypes.MEMBER_KEY,           key: CloudUtil.createKey()});
    await this.keys(sphere.id).create({keyType: keyTypes.BASIC_KEY,            key: CloudUtil.createKey()});
    await this.keys(sphere.id).create({keyType: keyTypes.LOCALIZATION_KEY,     key: CloudUtil.createKey()});
    await this.keys(sphere.id).create({keyType: keyTypes.SERVICE_DATA_KEY,     key: CloudUtil.createKey()});
    await this.keys(sphere.id).create({keyType: keyTypes.MESH_APPLICATION_KEY, key: CloudUtil.createKey()});
    await this.keys(sphere.id).create({keyType: keyTypes.MESH_NETWORK_KEY,     key: CloudUtil.createKey()});

    return sphere;
  }

  async delete(entity: Sphere, options?: Options): Promise<void> {
    // cascade
    let stones = await this.stones(entity.id).find({fields: {id:true}});
    if (stones.length > 0) {
      throw new HttpErrors.PreconditionFailed("Can't delete spheres while there are still Crownstones assigned to it.");
    }

    await this.stones(entity.id).delete()
    await this.locations(entity.id).delete()
    await this.scenes(entity.id).delete()
    await this.messages(entity.id).delete()
    await this.keys(entity.id).delete()
    await this.hubs(entity.id).delete()
    await this.sortedLists(entity.id).delete()
    await this.sphereFeatures(entity.id).delete()
    await this.trackingNumbers(entity.id).delete()
    await this.toons(entity.id).delete()
    return super.delete(entity, options);
  }


}









