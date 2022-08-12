import {
  Getter,
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
import {SphereFeature} from "../../models/sphere-feature.model";
import {Toon} from "../../models/toon.model";
import {SphereAccess} from "../../models/sphere-access.model";
import {LocationRepository} from "./location.repository";
import {UserRepository} from "../users/user.repository";
import {StoneRepository} from "./stone.repository";
import {SceneRepository} from "./scene.repository";
import {MessageRepository} from "./message.repository";
import {HubRepository} from "../users/hub.repository";
import {SphereFeatureRepository} from "./sphere-feature.repository";
import {ToonRepository} from "./toon.repository";
import {SphereAccessRepository} from "./sphere-access.repository";
import {SphereTrackingNumber} from "../../models/sphere-tracking-number.model";
import {SphereTrackingNumberRepository} from "./sphere-tracking-number.repository";
import {CloudUtil} from "../../util/CloudUtil";
import {keyTypes} from "../../enums";
import {HttpErrors} from "@loopback/rest";
import {Dbs} from "../../modules/containers/RepoContainer";
import {FingerprintV2} from "../../models/fingerprint-v2.model";
import {FingerprintV2Repository} from "./fingerprint-v2.repository";
import {MessageV2Repository} from "./messageV2.repository";
import {MessageV2} from "../../models/messageV2.model";


export class SphereRepository extends TimestampedCrudRepository<Sphere,typeof Sphere.prototype.id > {
  public stones:          HasManyRepositoryFactory<Stone,         typeof Stone.prototype.id>;
  public locations:       HasManyRepositoryFactory<Location,      typeof Location.prototype.id>;
  public scenes:          HasManyRepositoryFactory<Scene,         typeof Scene.prototype.id>;
  public fingerprints:    HasManyRepositoryFactory<FingerprintV2, typeof FingerprintV2.prototype.id>;
  public messages:        HasManyRepositoryFactory<MessageV2,     typeof MessageV2.prototype.id>;
  public hubs:            HasManyRepositoryFactory<Hub,           typeof Hub.prototype.id>;
  public sphereFeatures:  HasManyRepositoryFactory<SphereFeature, typeof SphereFeature.prototype.id>;
  public trackingNumbers: HasManyRepositoryFactory<SphereTrackingNumber, typeof SphereTrackingNumber.prototype.id>;
  public toons:           HasManyRepositoryFactory<Toon,          typeof Toon.prototype.id>;
  public users:           HasManyThroughRepositoryFactory<User,   typeof User.prototype.id, SphereAccess, typeof Sphere.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereAccessRepository') sphereAccessRepoGetter: Getter<SphereAccessRepository>,
    @repository.getter('UserRepository') userRepoGetter: Getter<UserRepository>,

    @repository(StoneRepository)         protected stoneRepo:         StoneRepository,
    @repository(LocationRepository)      protected locationRepo:      LocationRepository,
    @repository(SceneRepository)         protected sceneRepo:         SceneRepository,
    @repository(FingerprintV2Repository) protected fingerprintRepo:   FingerprintV2Repository,
    @repository(MessageV2Repository)     protected messageRepo:       MessageV2Repository,
    @repository(HubRepository)           protected hubRepo:           HubRepository,
    @repository(SphereFeatureRepository) protected sphereFeatureRepo: SphereFeatureRepository,
    @repository(SphereTrackingNumberRepository) protected sphereTrackingNumberRepo: SphereTrackingNumberRepository,
    @repository(ToonRepository)          protected toonRepo:          ToonRepository,
  ) {
    super(Sphere, datasource);
    this.users           = this.createHasManyThroughRepositoryFactoryFor('users', userRepoGetter, sphereAccessRepoGetter);

    this.stones          = this.createHasManyRepositoryFactoryFor('stones',      async () => stoneRepo);
    this.locations       = this.createHasManyRepositoryFactoryFor('locations',   async () => locationRepo);
    this.scenes          = this.createHasManyRepositoryFactoryFor('scenes',      async () => sceneRepo);
    this.fingerprints    = this.createHasManyRepositoryFactoryFor('fingerprints',async () => fingerprintRepo);
    this.messages        = this.createHasManyRepositoryFactoryFor('messages',    async () => messageRepo);
    this.hubs            = this.createHasManyRepositoryFactoryFor('hubs',        async () => hubRepo);
    this.sphereFeatures  = this.createHasManyRepositoryFactoryFor('features',    async () => sphereFeatureRepo);
    this.trackingNumbers = this.createHasManyRepositoryFactoryFor('trackingNumbers',async () => sphereTrackingNumberRepo);
    this.toons           = this.createHasManyRepositoryFactoryFor('toons',       async () => toonRepo);

    // add this line to register inclusion resolver
    this.registerInclusionResolver('stones',          this.stones.inclusionResolver);
    this.registerInclusionResolver('locations',       this.locations.inclusionResolver);
    this.registerInclusionResolver('scenes',          this.scenes.inclusionResolver);
    this.registerInclusionResolver('fingerprints',    this.fingerprints.inclusionResolver);
    this.registerInclusionResolver('messages',        this.messages.inclusionResolver);
    this.registerInclusionResolver('hubs',            this.hubs.inclusionResolver);
    this.registerInclusionResolver('features',        this.sphereFeatures.inclusionResolver);
    this.registerInclusionResolver('trackingNumbers', this.trackingNumbers.inclusionResolver);
    this.registerInclusionResolver('toons',           this.toons.inclusionResolver);
    this.registerInclusionResolver('users',           this.users.inclusionResolver);
  }

  async create(entity: DataObject<Sphere>, options?: Options): Promise<Sphere> {
    if (!entity.uuid) { entity.uuid = CloudUtil.createIBeaconUUID(); }
    if (!entity.uid)  { entity.uid  = CloudUtil.createShortUID(); }

    let sphere = await super.create(entity, options);

    await Dbs.sphereKeys.createAll([
      {sphereId: sphere.id, keyType: keyTypes.ADMIN_KEY,            key: CloudUtil.createKey(), ttl:0},
      {sphereId: sphere.id, keyType: keyTypes.MEMBER_KEY,           key: CloudUtil.createKey(), ttl:0},
      {sphereId: sphere.id, keyType: keyTypes.BASIC_KEY,            key: CloudUtil.createKey(), ttl:0},
      {sphereId: sphere.id, keyType: keyTypes.LOCALIZATION_KEY,     key: CloudUtil.createKey(), ttl:0},
      {sphereId: sphere.id, keyType: keyTypes.SERVICE_DATA_KEY,     key: CloudUtil.createKey(), ttl:0},
      {sphereId: sphere.id, keyType: keyTypes.MESH_APPLICATION_KEY, key: CloudUtil.createKey(), ttl:0},
      {sphereId: sphere.id, keyType: keyTypes.MESH_NETWORK_KEY,     key: CloudUtil.createKey(), ttl:0},
    ]);
    return sphere;
  }

  async deleteById(id: any, options?: Options): Promise<void> {
    if (!id) { throw new HttpErrors.BadRequest('id is required'); }

    // cascade
    let stones = await this.stones(id).find({fields: {id:true}});
    if (stones.length > 0) {
      throw new HttpErrors.PreconditionFailed("Can't delete spheres while there are still Crownstones assigned to it.");
    }

    await Dbs.sphereKeys.deleteAll({sphereId: id});

    await this.stones(id).delete()
    await this.locations(id).delete()
    await this.fingerprints(id).delete()
    await this.scenes(id).delete()
    await this.messages(id).delete()
    await this.hubs(id).delete()
    await this.sphereFeatures(id).delete()
    await this.trackingNumbers(id).delete()
    await this.toons(id).delete()
    
    return super.deleteById(id, options);
  }


}









