import type { Client } from "discord.js";
import { Event } from "../../base/Event.js";

export class Ready extends Event<"clientReady"> {
    constructor() {
        super("clientReady", true)
    }

    public run(client: Client<true>): void {
        const {username, id} = client.user
        this.logger.log(`logged in as [${username}]`)
    }
}