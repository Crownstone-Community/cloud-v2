import {Entity, model, property} from '@loopback/repository';

@model()
export class ReleaseNotes extends Entity {
  @property({type: 'string'})
  en: string;

  @property({type: 'string'})
  nl: string;

  @property({type: 'string'})
  de: string;

  @property({type: 'string'})
  es: string;

  @property({type: 'string'})
  it: string;

  @property({type: 'string'})
  fr: string;
}
