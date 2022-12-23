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
      this.__handleId(entity);
      this.__updateTimes(entity);
      return super.create(entity, options);
    }

    async createAll(entities: DataObject<E>[], options?: Options): Promise<E[]> {
      for (let i = 0; i < entities.length; i++) {
        this.__handleId(entities[i]);
        this.__updateTimes(entities[i], options);
      }
      return super.createAll(entities, options);
    }

    async updateAll(
      data: DataObject<E>,
      where?: Where<E>,
      options?: Options,
    ): Promise<Count> {
      if (!options || options.acceptTimes !== true) {
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


    __handleId(entity: DataObject<E>) {
      // @ts-ignore
      if (CONFIG.generateCustomIds && !entity.id) {
        // @ts-ignore
        entity.id = CloudUtil.createId(this.constructor.name)
      }
    }
    __updateTimes(entity: DataObject<E>, options?: Options) {
      entity.createdAt = entity.createdAt ?? CloudUtil.getDate();
      entity.updatedAt = entity.updatedAt ?? CloudUtil.getDate();
    }
}

