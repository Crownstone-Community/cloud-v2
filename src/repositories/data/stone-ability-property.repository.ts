import {BelongsToAccessor, DataObject, Getter, juggler, Options, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {StoneAbilityProperty} from "../../models/stoneSubModels/stone-ability-property.model";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneAbility} from "../../models/stoneSubModels/stone-ability.model";
import {StoneRepository} from "./stone.repository";
import {StoneAbilityRepository} from "./stone-ability.repository";
import {ValidationError} from "../../util/errors/ValidationError";


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
    this.sphere  = this.createBelongsToAccessorFor( 'sphere', sphereRepoGetter);
    this.stone   = this.createBelongsToAccessorFor(  'stone', stoneRepoGetter);
    this.ability = this.createBelongsToAccessorFor('ability', abilityRepoGetter);
  }

  async create(entity: DataObject<StoneAbilityProperty>, options?: Options): Promise<StoneAbilityProperty> {
    // We validate the abilityProperty to have one copy of this type per ability
    // Since abilityIds are unique, we query if there is a copy of this type on this ability.
    // If there is one, add it to the error.
    await this._validate(entity)

    return super.create(entity, options);
  }

  async createAll(entities: DataObject<StoneAbilityProperty>[], options?: Options): Promise<StoneAbilityProperty[]> {
    for (let entity of entities) {
      await this._validate(entity);
    }
    return super.createAll(entities, options);
  }

  async _validate(entity: DataObject<StoneAbilityProperty>) {
    let existingEntity = await this.findOne({where: {abilityId: entity.abilityId, type: entity.type}}, );
    if (existingEntity) {
      throw new ValidationError(existingEntity);
    }
  }

}
