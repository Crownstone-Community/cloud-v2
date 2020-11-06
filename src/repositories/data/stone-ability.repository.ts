import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneRepository} from "./stone.repository";
import {StoneAbilityProperty} from "../../models/stoneSubModels/stone-ability-property.model";
import {StoneAbilityPropertyRepository} from "./stone-ability-property.repository";


export class StoneAbilityRepository extends TimestampedCrudRepository<StoneAbility,typeof StoneAbility.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly stone:  BelongsToAccessor<Stone,  typeof Stone.prototype.id>;
  public properties: HasManyRepositoryFactory<StoneAbilityProperty, typeof StoneAbilityProperty.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('StoneRepository') stoneRepoGetter: Getter<StoneRepository>,
    @repository(StoneAbilityPropertyRepository)   protected stoneAbilityPropertyRepo: StoneAbilityPropertyRepository,
    ) {
    super(StoneAbility, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.stone  = this.createBelongsToAccessorFor('stone', stoneRepoGetter);
    this.properties = this.createHasManyRepositoryFactoryFor('properties',         async () => stoneAbilityPropertyRepo);

    this.registerInclusionResolver('properties', this.properties.inclusionResolver);
  }
}
