import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {StoneAbilityProperty} from "../../models/stoneSubModels/stone-ability-property.model";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";


export class StoneAbilityPropertyRepository extends TimestampedCrudRepository<StoneAbilityProperty,typeof StoneAbilityProperty.prototype.id > {
  public readonly sphere:  BelongsToAccessor<Sphere,       typeof Sphere.prototype.id>;
  public readonly stone:   BelongsToAccessor<Stone,        typeof Stone.prototype.id>;
  public readonly ability: BelongsToAccessor<StoneAbility, typeof StoneAbility.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>) {
    super(StoneAbilityProperty, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepositoryGetter);
  }

}
