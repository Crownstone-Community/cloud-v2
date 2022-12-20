import {BelongsToAccessor, DataObject, Getter, juggler, Options, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {SphereKeys} from "../../models/sphere-key.model";
import {Sphere} from "../../models/sphere.model";


export class SphereKeyRepository extends TimestampedCrudRepository<SphereKeys,typeof SphereKeys.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>) {
    super(SphereKeys, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }

  async importCreate(entity: DataObject<SphereKeys>, options?: Options): Promise<SphereKeys> {
    return super.create(entity, options);
  }
}
