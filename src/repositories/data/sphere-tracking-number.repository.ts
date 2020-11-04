import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {SphereTrackingNumber} from "../../models/sphere-tracking-number.model";
import {Sphere} from "../../models/sphere.model";


export class SphereTrackingNumberRepository extends TimestampedCrudRepository<SphereTrackingNumber,typeof SphereTrackingNumber.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>) {
    super(SphereTrackingNumber, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }

}
