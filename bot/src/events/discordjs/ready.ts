import type { Client } from "discord.js";
import { Event } from "../../base/Event.js";

export class Ready extends Event<"clientReady"> {
    constructor() {
        super("clientReady", true)
    }

    protected async execute(client: Client<true>) {
        const {username, id} = client.user
        this.logger.log(`logged in as [${username}]`)
    }
}