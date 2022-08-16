import {Entity, model, property} from '@loopback/repository';
import {MessageV2} from "../messageV2.model";

@model()
export class MessageWithRecipients extends Entity {

  @property({required: true})
  message: MessageV2;

  @property({type:'array', itemType:'string'})
  recipients: string[];
}
