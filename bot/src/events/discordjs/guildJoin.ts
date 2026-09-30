import { type Guild } from "discord.js";
import { Event } from "../../base/Event.js";

export class GuildJoin extends Event<"guildCreate"> {
    constructor() {
        super("guildCreate", true)
    }

    protected async execute(guild: Guild): Promise<void> {
        const {name, id} = guild
        const bot = guild.members.me;
        this.logger.log(`added to guild: [${name}:${id}]`)

        const roleName = "DJ"
    
        // TODO: store created role id in db and check if in guild this role already exists, delete old create new
        return    

    }
}