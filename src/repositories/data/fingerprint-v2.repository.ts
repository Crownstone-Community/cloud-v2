import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import { SphereRepository } from "./sphere.repository";
import { Sphere } from "../../models/sphere.model";
import {FingerprintV2} from "../../models/fingerprint-v2.model";
import {HttpErrors} from "@loopback/rest";
import {Dbs} from "../../modules/containers/RepoContainer";


export class FingerprintV2Repository extends TimestampedCrudRepository<FingerprintV2,typeof FingerprintV2.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>
  ) {
    super(FingerprintV2, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);
  }


  async create(fingerprint: FingerprintV2): Promise<FingerprintV2> {
    if (!fingerprint.locationId) {
      throw new HttpErrors.UnprocessableEntity('locationId is required');
    }

    try {
      let location = await Dbs.location.findById(fingerprint.locationId);
      // this location id does not belong to this sphere.
      if (String(location?.sphereId) !== String(fingerprint.sphereId)) {
        throw new Error();
      }
    }
    catch (err) {
      throw new HttpErrors.UnprocessableEntity('locationId is invalid');
    }

    return super.create(fingerprint);
  }
}

