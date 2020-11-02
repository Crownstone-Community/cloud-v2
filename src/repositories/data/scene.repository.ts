import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Scene } from "../../models";


export class SceneRepository extends TimestampedCrudRepository<Scene,typeof Scene.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Scene, datasource);
  }

}
