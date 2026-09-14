import type { Guild } from "discord.js";
import { Event } from "../../base/Event.js";
import { Color } from "../../constants.js";

export class Ready extends Event<"guildCreate"> {
    constructor() {
        super("guildCreate", true)
    }

    protected async execute(guild: Guild): Promise<void> {
        const {name, id} = guild
        this.logger.log(`added to guild: [${name}:${id}]`)

        // give role for colored name
        const role = await guild.roles.create({
            name: "djchan",
            color: Color.bot,
            hoist: true,
            reason: "bot color for cute name color"
        })

        const botMember = guild.members.me;
        if (botMember) {
            await botMember.roles.add(role);
        }
    }
}