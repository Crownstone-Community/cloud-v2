import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from "../bases/timestamped-crud-repository";
import {Hub} from "../../models/hub.model";
import {Sphere} from "../../models/sphere.model";
import {SphereRepository} from "../data/sphere.repository";
import {StoneRepository} from "../data/stone.repository";
import {LocationRepository} from "../data/location.repository";
import {Location} from "../../models/location.model";
import {Stone} from "../../models/stone.model";


export class HubRepository extends TimestampedCrudRepository<Hub,typeof Hub.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly linkedStone: BelongsToAccessor<Stone, typeof Stone.prototype.id>;
  public readonly location: BelongsToAccessor<Location, typeof Location.prototype.id>;

  constructor(
    @inject('datasources.users') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('StoneRepository')  stoneRepoGetter: Getter<StoneRepository>,
    @repository.getter('LocationRepository')  locationRepoGetter: Getter<LocationRepository>) {
    super(Hub, datasource);
    this.sphere      = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.linkedStone = this.createBelongsToAccessorFor('linkedStone', stoneRepoGetter);
    this.location    = this.createBelongsToAccessorFor('location', locationRepoGetter);
  }
}

