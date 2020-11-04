import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {StoneSwitchState} from "../../models/stoneSubModels/stone-switch-state.model";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneRepository} from "./stone.repository";


export class StoneSwitchStateRepository extends TimestampedCrudRepository<StoneSwitchState,typeof StoneSwitchState.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly stone:  BelongsToAccessor<Stone,  typeof Stone.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('StoneRepository') stoneRepoGetter: Getter<StoneRepository>) {
    super(StoneSwitchState, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.stone  = this.createBelongsToAccessorFor('stone', stoneRepoGetter);
  }

}
