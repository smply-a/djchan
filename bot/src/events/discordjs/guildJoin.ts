import { type Guild } from "discord.js";
import { Event } from "../../base/Event.js";
import { Color } from "../../constants.js";

export class GuildJoin extends Event<"guildCreate"> {
    constructor() {
        super("guildCreate", true)
    }

    protected async execute(guild: Guild): Promise<void> {
        const {name, id} = guild
        const bot = guild.members.me;
        this.logger.log(`added to guild: [${name}:${id}]`)

        const roleName = "DJ"
    
        // TODO: store created role id in db and check if in guild a bot role already exists, delete old create new    
        const role = await guild.roles.create({
            name: roleName,
            colors: {primaryColor: Color.bot},
            reason: "To make bot have beautiful color",
            hoist: true
        })

        if (bot) {
            bot.roles.add(role)
        }
    }
}