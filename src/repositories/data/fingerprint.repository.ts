import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {Fingerprint} from "../../models/fingerprint.model";
import {Sphere} from "../../models/sphere.model";


export class FingerprintRepository extends TimestampedCrudRepository<Fingerprint,typeof Fingerprint.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>
  ) {
    super(Fingerprint, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepositoryGetter);
  }


}
