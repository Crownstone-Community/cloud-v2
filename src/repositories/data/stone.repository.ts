import { juggler} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {Sphere, Stone} from "../../models";
import {DataObject, Options} from "@loopback/repository/src/common-types";


export class StoneRepository extends TimestampedCrudRepository<Stone,typeof Stone.prototype.id > {

  constructor( @inject('datasources.data') protected datasource: juggler.DataSource ) {
    super(Stone, datasource);
  }

  async create(entity: DataObject<Stone>, options?: Options): Promise<Stone> {
    // generate keys
    // generate uid
    // generate major/minor

    return super.create(entity, options);
  }

  async delete(entity: Stone, options?: Options): Promise<void> {
    // cascade
    return super.delete(entity, options);
  }

}
