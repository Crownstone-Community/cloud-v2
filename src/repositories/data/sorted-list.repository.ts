import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {SphereRepository} from "./sphere.repository";
import {SortedList} from "../../models/sorted-list.model";
import {Sphere} from "../../models/sphere.model";


export class SortedListRepository extends TimestampedCrudRepository<SortedList,typeof SortedList.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepositoryGetter: Getter<SphereRepository>) {
    super(SortedList, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepositoryGetter);
  }
}
