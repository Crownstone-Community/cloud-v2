import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {SphereKey} from "../../models/sphere-key.model";
import {Sphere} from "../../models/sphere.model";


export class SphereKeyRepository extends TimestampedCrudRepository<SphereKey,typeof SphereKey.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>) {
    super(SphereKey, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepositoryGetter);
  }
}
