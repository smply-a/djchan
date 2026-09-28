import { Event } from "../../base/Event.js";
export class Ready extends Event {
    constructor() {
        super("clientReady", true);
    }
    async execute(client) {
        const { username, id } = client.user;
        this.logger.log(`logged in as [${username}]`);
        // set presence
        client.user.setPresence({
            status: "online",
            activities: [{
                    name: "streaming yt music",
                    type: 4
                }]
        });
    }
}
