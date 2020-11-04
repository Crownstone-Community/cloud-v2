import {Model, property,} from '@loopback/repository';
import {MixinTarget} from "@loopback/core";

export function AddTimestamps<T extends MixinTarget<Model>>(superClass: T) {
  class MixedModel extends superClass {

    @property({type: 'date'})
    updatedAt: Date;

    @property({type: 'date', defaultFn: 'now' })
    createdAt: Date;
  }
  return MixedModel;
}