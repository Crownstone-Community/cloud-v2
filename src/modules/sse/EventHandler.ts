import {CommandEventHandler} from "./events/CommandEventHandler";
import {DataChangeEventHandler} from "./events/DataChangeEventHandler";
import {PresenceEventHandler} from "./events/PresenceEventHandler";
import {TransformEventHandler} from "./events/TransformEventHandler";

class EventHandlerClass {

  presence:   PresenceEventHandler;
  command:    CommandEventHandler;
  dataChange: DataChangeEventHandler;
  transform:  TransformEventHandler;

  constructor() {
    this.presence   = new PresenceEventHandler();
    this.command    = new CommandEventHandler();
    this.dataChange = new DataChangeEventHandler();
    this.transform  = new TransformEventHandler();
  }
}

export const EventHandler = new EventHandlerClass();

