import {
  Count,
  DataObject,
  DefaultCrudRepository,
  Entity,
  Options, Where
} from "@loopback/repository";
import {CONFIG} from "../../config";
import {CloudUtil} from "../../util/CloudUtil";

export class TimestampedCrudRepository< E extends Entity & {createdAt?: Date; updatedAt?: Date},
  ID> extends DefaultCrudRepository<E, ID> {

    async create(entity: DataObject<E>, options?: Options): Promise<E> {
      if (CONFIG.generateCustomIds) {
        // @ts-ignore
        entity.id = CloudUtil.createId(this.constructor.name)
      }

      entity.createdAt = CloudUtil.getDate();
      entity.updatedAt = entity.updatedAt ?? CloudUtil.getDate();
      return super.create(entity, options);
    }

    async updateAll(
      data: DataObject<E>,
      where?: Where<E>,
      options?: Options,
    ): Promise<Count> {
      if (!options || options.dontOverwriteTimes !== true) {
        data.updatedAt = CloudUtil.getDate();
      }
      return super.updateAll(data, where, options);
    }

    async replaceById(
      id: ID,
      data: DataObject<E>,
      options?: Options,
    ): Promise<void> {
      data.updatedAt = CloudUtil.getDate();
      return super.replaceById(id, data, options);
    }
}