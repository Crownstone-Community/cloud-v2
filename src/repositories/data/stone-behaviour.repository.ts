import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {StoneBehaviour} from "../../models/stoneSubModels/stone-behaviour.model";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneRepository} from "./stone.repository";


export class StoneBehaviourRepository extends TimestampedCrudRepository<StoneBehaviour,typeof StoneBehaviour.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly stone:  BelongsToAccessor<Stone,  typeof Stone.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('StoneRepository') stoneRepoGetter: Getter<StoneRepository>) {
    super(StoneBehaviour, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.stone  = this.createBelongsToAccessorFor('stone', stoneRepoGetter);
  }
}
