import {CommandEventHandler} from "./events/CommandEventHandler";
import {DataChangeEventHandler} from "./events/DataChangeEventHandler";
import {PresenceEventHandler} from "./events/PresenceEventHandler";

class EventHandlerClass {

  presence:   PresenceEventHandler;
  command:    CommandEventHandler;
  dataChange: DataChangeEventHandler;

  constructor() {
    this.presence   = new PresenceEventHandler();
    this.command    = new CommandEventHandler();
    this.dataChange = new DataChangeEventHandler();
  }
}

export const EventHandler = new EventHandlerClass();

