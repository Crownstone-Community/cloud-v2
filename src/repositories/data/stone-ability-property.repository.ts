import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {StoneAbilityProperty} from "../../models/stoneSubModels/stone-ability-property.model";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";
import {StoneRepository} from "./stone.repository";
import {StoneAbilityRepository} from "./stone-ability.repository";


export class StoneAbilityPropertyRepository extends TimestampedCrudRepository<StoneAbilityProperty,typeof StoneAbilityProperty.prototype.id > {
  public readonly sphere:  BelongsToAccessor<Sphere,       typeof Sphere.prototype.id>;
  public readonly stone:   BelongsToAccessor<Stone,        typeof Stone.prototype.id>;
  public readonly ability: BelongsToAccessor<StoneAbility, typeof StoneAbility.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('StoneRepository') stoneRepoGetter: Getter<StoneRepository>,
    @repository.getter('StoneAbilityRepository') abilityRepoGetter: Getter<StoneAbilityRepository>,

  ) {
    super(StoneAbilityProperty, datasource);
    this.sphere = this.createBelongsToAccessorFor( 'sphere', sphereRepoGetter);
    this.stone = this.createBelongsToAccessorFor(  'stone', stoneRepoGetter);
    this.ability = this.createBelongsToAccessorFor('ability', abilityRepoGetter);
  }

}
