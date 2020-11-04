import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {Hub} from "../../models/hub.model";
import {Sphere} from "../../models/sphere.model";
import {SphereRepository} from "../data/sphere.repository";


export class HubRepository extends TimestampedCrudRepository<Hub,typeof Hub.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.users') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>) {
    super(Hub, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }
}

