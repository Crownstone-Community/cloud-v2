import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import { TimestampedCrudRepository } from "../bases/timestamped-crud-repository";
import {DataObject, Options} from "@loopback/repository/src/common-types";
import {SphereRepository} from "./sphere.repository";
import {Location} from "../../models/location.model";
import {Sphere} from "../../models/sphere.model";
import {HttpErrors} from "@loopback/rest";
import {FingerprintV2} from "../../models/fingerprint-v2.model";
import {FingerprintV2Repository} from "./fingerprint-v2.repository";


export class LocationRepository extends TimestampedCrudRepository<Location,typeof Location.prototype.id > {
  public readonly sphere: BelongsToAccessor<Sphere, typeof Sphere.prototype.id>;
  public fingerprints:   HasManyRepositoryFactory<FingerprintV2, typeof FingerprintV2.prototype.id>;

  constructor(
    @inject('datasources.data') protected datasource: juggler.DataSource,
    @repository.getter('SphereRepository') sphereRepoGetter: Getter<SphereRepository>,
    @repository(FingerprintV2Repository) protected fingerprintRepo:   FingerprintV2Repository,
    ) {
    super(Location, datasource);
    this.sphere = this.createBelongsToAccessorFor('sphere', sphereRepoGetter);

    this.fingerprints = this.createHasManyRepositoryFactoryFor('fingerprints',async () => fingerprintRepo);
    this.registerInclusionResolver('fingerprints',    this.fingerprints.inclusionResolver);
  }

  async create(entity: DataObject<Location>, options?: Options): Promise<Location> {
    // generate uid
    await injectUID(this, entity);

    return super.create(entity, options);
  }

  async delete(entity: Location, options?: Options): Promise<void> {
    // cascade
    if (!entity.id) { throw "locationId missing"; }

    await this.fingerprints(entity.id).delete()
    return super.delete(entity, options);
  }

}


async function injectUID( locationRepo: LocationRepository, location: DataObject<Location> ) {
  if (!location.uid) { return }

  // To inject a UID, we look for the highest available one. The new one is one higher
  // If this is more than the allowed amount of Crownstones, we loop over all Crownstones in the Sphere to check for gaps
  // Gaps can form when Crownstones are deleted.
  // If all gaps are filled, we throw an error to tell the user that he reached the maximum amount.
  let locations = await locationRepo.find({where: {sphereId: location.sphereId}, order: ["uid DESC"], limit: 1})

  if (locations.length > 0) {
    let location = locations[0];
    if ((location.uid + 1) > 64) {
      await injectUIDinGap(locationRepo, location);
    }
    else {
      location.uid = location.uid + 1;
    }
  }
  else {
    location.uid = 1;
  }
}

async function injectUIDinGap(locationRepo: LocationRepository, location: DataObject<Location>) {
  let allLocations = await locationRepo.find({where: {sphereId: location.sphereId}, order: ["uid ASC"]})
  let availableUID = 0;
  for (let i = 0; i < allLocations.length; i++) {
    let expectedUID = i+1;
    if (allLocations[i].uid !== expectedUID) {
      availableUID = expectedUID;
      break;
    }
  }

  if (availableUID > 0 && availableUID < 65) {
    location.uid = availableUID;
  }
  else {
    throw new HttpErrors.UnprocessableEntity("The maximum number of Locations per Sphere, 64, has been reached. You cannot add another Location without deleting one first.")
  }
}