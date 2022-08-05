import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereRepository } from "./sphere.repository";
import { Sphere } from "../../models/sphere.model";
import {FingerprintV2} from "../../models/fingerprint-v2.model";


export class FingerprintV2Repository extends TimestampedCrudRepository<FingerprintV2,typeof FingerprintV2.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>
  ) {
    super(FingerprintV2, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }


}
