import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { Sphere } from "../../models";
import {DataObject, Options} from "@loopback/repository/src/common-types";


export class SphereRepository extends TimestampedCrudRepository<Sphere,typeof Sphere.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Sphere, datasource);
  }

  async create(entity: DataObject<Sphere>, options?: Options): Promise<Sphere> {
    // generate keys
    // generate uuids
    // generate uid
    // inject owner

    return super.create(entity, options);
  }

  async delete(entity: Sphere, options?: Options): Promise<void> {
    // cascade

    return super.delete(entity, options);
  }


}
