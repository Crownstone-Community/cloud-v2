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


export class StoneRepository extends TimestampedCrudRepository<Stone,typeof Stone.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly location: BelongsToAccessor<Location, typeof Location.prototype.id>;
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
  }

  async create(entity: DataObject<Stone>, options?: Options): Promise<Stone> {
    // generate keys
    // generate uid
    // generate major/minor

    return super.create(entity, options);
  }

  async delete(entity: Stone, options?: Options): Promise<void> {
    // cascade
    return super.delete(entity, options);
  }

}
