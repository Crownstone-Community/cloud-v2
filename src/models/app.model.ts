import {model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {PushSettings} from "./subModels/push-settings.model";

@model()
export class App extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  name: string;

  @property()
  pushSettings: PushSettings;

}
