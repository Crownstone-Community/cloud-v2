import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {
  Location,
  Sphere,
  SphereTrackingNumber,
  Stone,
  StoneAbility,
  StoneBehaviour,
  StoneSwitchState
} from "../../models";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {SphereRepository} from "./sphere.repository";
import {LocationRepository} from "./location.repository";
import {StoneSwitchStateRepository} from "./stone-switch-state.repository";
import {StoneBehaviourRepository} from "./stone-behaviour.repository";
import {StoneAbilityRepository} from "./stone-ability.repository";


export class StoneRepository extends TimestampedCrudRepository<Stone,typeof Stone.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly location: BelongsToAccessor<Location, typeof Location.prototype.id>;
  public readonly currentSwitchState: BelongsToAccessor<StoneSwitchState, typeof StoneSwitchState.prototype.id>;

  public behaviours:         HasManyRepositoryFactory<StoneBehaviour,     typeof StoneBehaviour.prototype.id>;
  public abilities:          HasManyRepositoryFactory<StoneAbility,       typeof StoneAbility.prototype.id>;
  public switchStateHistory: HasManyRepositoryFactory<StoneSwitchState,   typeof StoneSwitchState.prototype.id>;


  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>,
    @repository.getter('LocationRepository') locationRepositoryGetter: Getter<LocationRepository>,
    @repository.getter('StoneSwitchStateRepository') stoneSwitchStateRepositoryGetter: Getter<StoneSwitchStateRepository>,

    @repository(StoneBehaviourRepository)   protected stoneBehaviourRepository: StoneBehaviourRepository,
    @repository(StoneAbilityRepository)     protected stoneAbilityRepository: StoneAbilityRepository,
    @repository(StoneSwitchStateRepository) protected stoneSwitchStateRepository: StoneSwitchStateRepository,
    ) {
    super(Stone, datasource);
    this.sphere = this.createBelongsToAccessorFor(  'sphere',   sphereRepositoryGetter);
    this.location = this.createBelongsToAccessorFor('location', locationRepositoryGetter);
    this.currentSwitchState = this.createBelongsToAccessorFor('currentSwitchState', stoneSwitchStateRepositoryGetter);

    this.behaviours         = this.createHasManyRepositoryFactoryFor('behaviours',        async () => stoneBehaviourRepository);
    this.abilities          = this.createHasManyRepositoryFactoryFor('abilities',         async () => stoneAbilityRepository);
    this.switchStateHistory = this.createHasManyRepositoryFactoryFor('switchStateHistory',async () => stoneSwitchStateRepository);
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
