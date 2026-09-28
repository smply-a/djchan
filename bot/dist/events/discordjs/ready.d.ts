import type { Client } from "discord.js";
import { Event } from "../../base/Event.js";
export declare class Ready extends Event<"clientReady"> {
    constructor();
    protected execute(client: Client<true>): Promise<void>;
}
