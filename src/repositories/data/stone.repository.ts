import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {SphereRepository} from "./sphere.repository";
import {LocationRepository} from "./location.repository";
import {StoneSwitchStateRepository} from "./stone-switch-state.repository";
import {StoneBehaviourRepository} from "./stone-behaviour.repository";
import {StoneAbilityRepository} from "./stone-ability.repository";
import {Stone} from "../../models/stone.model";
import {Sphere} from "../../models/sphere.model";
import {Location} from "../../models/location.model";
import {StoneSwitchState} from "../../models/stoneSubModels/stone-switch-state.model";
import {StoneBehaviour} from "../../models/stoneSubModels/stone-behaviour.model";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";
import * as crypto from "crypto";
import {HttpErrors} from "@loopback/rest";
import {keyTypes} from "../../enums";
import {Dbs} from "../../modules/containers/RepoContainer";
import {CloudUtil} from "../../util/CloudUtil";


export class StoneRepository extends TimestampedCrudRepository<Stone,typeof Stone.prototype.id > {
  public readonly sphere:             BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly location:           BelongsToAccessor<Location, typeof Location.prototype.id>;
  public readonly currentSwitchState: BelongsToAccessor<StoneSwitchState, typeof StoneSwitchState.prototype.id>;

  public behaviours:         HasManyRepositoryFactory<StoneBehaviour,     typeof StoneBehaviour.prototype.id>;
  public abilities:          HasManyRepositoryFactory<StoneAbility,       typeof StoneAbility.prototype.id>;
  public switchStateHistory: HasManyRepositoryFactory<StoneSwitchState,   typeof StoneSwitchState.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('LocationRepository') locationRepoGetter: Getter<LocationRepository>,
    @repository.getter('StoneSwitchStateRepository') stoneSwitchStateRepoGetter: Getter<StoneSwitchStateRepository>,

    @repository(StoneBehaviourRepository)   protected stoneBehaviourRepo: StoneBehaviourRepository,
    @repository(StoneAbilityRepository)     protected stoneAbilityRepo: StoneAbilityRepository,
    @repository(StoneSwitchStateRepository) protected stoneSwitchStateRepo: StoneSwitchStateRepository,
    ) {
    super(Stone, datasource);
    this.sphere = this.createBelongsToAccessorFor(  'sphere',   sphereRepoGetter);
    this.location = this.createBelongsToAccessorFor('location', locationRepoGetter);
    this.currentSwitchState = this.createBelongsToAccessorFor('currentSwitchState', stoneSwitchStateRepoGetter);

    this.behaviours         = this.createHasManyRepositoryFactoryFor('behaviours',        async () => stoneBehaviourRepo);
    this.abilities          = this.createHasManyRepositoryFactoryFor('abilities',         async () => stoneAbilityRepo);
    this.switchStateHistory = this.createHasManyRepositoryFactoryFor('switchStateHistory',async () => stoneSwitchStateRepo);

    this.registerInclusionResolver('location',           this.location.inclusionResolver);
    this.registerInclusionResolver('behaviours',         this.behaviours.inclusionResolver);
    this.registerInclusionResolver('abilities',          this.abilities.inclusionResolver);
    this.registerInclusionResolver('switchStateHistory', this.switchStateHistory.inclusionResolver);
    this.registerInclusionResolver('currentSwitchState', this.currentSwitchState.inclusionResolver);

  }

  async create(entity: DataObject<Stone>, options?: Options): Promise<Stone> {
    // generate uid
    // generate major/minor
    injectMajorMinor(entity);
    await injectUID(this, entity);
    let stone = await super.create(entity, options);

    // generate keys
    await Dbs.stoneKeys.createAll([
      {sphereId: entity.sphereId, stoneId: entity.id, keyType: keyTypes.DEVICE_UART_KEY, key: CloudUtil.createKey(), ttl:0},
      {sphereId: entity.sphereId, stoneId: entity.id, keyType: keyTypes.MESH_DEVICE_KEY, key: CloudUtil.createKey(), ttl:0}
    ]);

    // todo: EVENT HOOK
    return stone;
  }

  async delete(entity: Stone, options?: Options): Promise<void> {
    if (!entity.id) { throw "StoneIdRequired" }

    await this.behaviours(entity.id).delete()
    await this.abilities(entity.id).delete()
    await this.switchStateHistory(entity.id).delete()
    await Dbs.stoneKeys.deleteAll({stoneId: entity.id});

    return super.delete(entity, options);
  }

}


function injectMajorMinor(stone: DataObject<Stone>) {
  let buf = crypto.randomBytes(4);
  if (!stone.major) {
    stone.major = buf.readUInt16BE(0);
  }
  if (!stone.minor) {
    stone.minor = buf.readUInt16BE(2);
  }

  // this catches the case where the random number is 0 for either
  if (!stone.minor || !stone.major) {
    injectMajorMinor(stone);
  }
}

async function injectUID( stoneRepo: StoneRepository, stone: DataObject<Stone> ) {
  if (!stone.uid) { return }

  // To inject a UID, we look for the highest available one. The new one is one higher
  // If this is more than the allowed amount of Crownstones, we loop over all Crownstones in the Sphere to check for gaps
  // Gaps can form when Crownstones are deleted.
  // If all gaps are filled, we throw an error to tell the user that he reached the maximum amount.
  let stones = await stoneRepo.find({where: {sphereId: stone.sphereId}, order: ["uid DESC"], limit: 1})

  if (stones.length > 0) {
    let stone = stones[0];
    if ((stone.uid + 1) > 255) {
      await injectUIDinGap(stoneRepo, stone);
    }
    else {
      stone.uid = stone.uid + 1;
    }
  }
  else {
    stone.uid = 1;
  }
}

async function injectUIDinGap(stoneRepo: StoneRepository, stone: DataObject<Stone>) {
  let allStones = await stoneRepo.find({where: {sphereId: stone.sphereId}, order: ["uid ASC"]})
  let availableUID = 0;
  for (let i = 0; i < allStones.length; i++) {
    let expectedUID = i+1;
    if (allStones[i].uid !== expectedUID) {
      availableUID = expectedUID;
      break;
    }
  }

  if (availableUID > 0 && availableUID < 256) {
    stone.uid = availableUID;
  }
  else {
    throw new HttpErrors.UnprocessableEntity("The maximum number of Crownstones per Sphere, 255, has been reached. You cannot add another Crownstone without deleting one first.")
  }
}