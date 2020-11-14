import {model, property} from '@loopback/repository';
import {AddTimestamps} from "./bases/timestamp-mixin";
import {BaseEntity} from "./bases/base-entity";
import {ReleaseNotes} from "./subModels/release-notes.model";

@model()
export class Bootloader extends AddTimestamps(BaseEntity) {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  version: string;

  @property({type: 'array', itemType: 'string', required: true})
  supportedHardwareVersions: string[];

  @property({type: 'string', required: true})
  minimumAppVersion: string;

  @property({type: 'string'})
  minimumCompatibleVersion: string;

  @property({type: 'string'})
  dependsOnBootloaderVersion: string;

  @property({type: 'string', required: true})
  downloadUrl: string;

  @property({type: 'string', required: true})
  sha1hash: string;

  @property()
  releaseNotes: ReleaseNotes;

  @property({type: 'number', required: true})
  releaseLevel: number;


}

