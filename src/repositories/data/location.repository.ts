import {BelongsToAccessor, Getter, HasOneRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {SphereRepository} from "./sphere.repository";
import {Location} from "../../models/location.model";
import {Sphere} from "../../models/sphere.model";
import {Position} from "../../models/position.model";
import {PositionRepository} from "./position.repository";


export class LocationRepository extends TimestampedCrudRepository<Location,typeof Location.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly position: HasOneRepositoryFactory<Position, typeof Position.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('PositionRepository') positionRepoGetter: Getter<PositionRepository>,
    ) {
    super(Location, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.position = this.createHasOneRepositoryFactoryFor('sphereOverviewPosition', positionRepoGetter);
  }

  async create(entity: DataObject<Location>, options?: Options): Promise<Location> {
    // generate uid
    return super.create(entity, options);
  }
}
