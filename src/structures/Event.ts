import { ClientEvents } from "discord.js";

import { EventType } from "../typings/Event";

export class Event<ClientEvent extends keyof ClientEvents> {
  constructor(eventOptions: EventType<ClientEvent>) {
    Object.assign(this, eventOptions);
  }
}
