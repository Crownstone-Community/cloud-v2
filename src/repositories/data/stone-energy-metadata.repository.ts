import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {SphereRepository} from "./sphere.repository";
import {Sphere} from "../../models/sphere.model";
import {Stone} from "../../models/stone.model";
import {StoneRepository} from "./stone.repository";
import {CsCrudRepository} from "../bases/cs-crud-repository";
import {EnergyMetaData} from "../../models/stoneSubModels/stone-energy-metadata.model";


export class EnergyMetaDataRepository extends CsCrudRepository<EnergyMetaData,typeof EnergyMetaData.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public readonly stone:  BelongsToAccessor<Stone,  typeof Stone.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository.getter('StoneRepository')  stoneRepoGetter:  Getter<StoneRepository>) {
    super(EnergyMetaData, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
    this.stone  = this.createBelongsToAccessorFor('stone',  stoneRepoGetter);
  }
}
