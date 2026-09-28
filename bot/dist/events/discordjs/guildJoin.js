import {} from "discord.js";
import { Event } from "../../base/Event.js";
import { Color } from "../../constants.js";
export class GuildJoin extends Event {
    constructor() {
        super("guildCreate", true);
    }
    async execute(guild) {
        const { name, id } = guild;
        this.logger.log(`added to guild: [${name}:${id}]`);
        const botMember = guild.members.me;
        if (botMember) {
            const role = botMember.roles.botRole;
            await role?.setColors({
                primaryColor: Color.bot,
            });
            await role?.setHoist(true);
        }
    }
}
