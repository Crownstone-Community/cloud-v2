import {
  DataObject,
  DefaultCrudRepository,
  Entity,
  Options
} from "@loopback/repository";
import {CONFIG} from "../../config";
import {CloudUtil} from "../../util/CloudUtil";

export class CsCrudRepository< E extends Entity, ID> extends DefaultCrudRepository<E, ID> {

    async create(entity: DataObject<E>, options?: Options): Promise<E> {
      this.__handleId(entity);
      return super.create(entity, options);
    }

    async createAll(entities: DataObject<E>[], options?: Options): Promise<E[]> {
      for (let i = 0; i < entities.length; i++) {
        this.__handleId(entities[i]);
      }
      return super.createAll(entities, options);
    }

    __handleId(entity: DataObject<E>) {
      // @ts-ignore
      if (CONFIG.generateCustomIds && !entity.id) {
        // @ts-ignore
        entity.id = CloudUtil.createId(this.constructor.name)
      }
    }
}

