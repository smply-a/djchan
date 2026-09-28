import { type Guild } from "discord.js";
import { Event } from "../../base/Event.js";
export declare class GuildJoin extends Event<"guildCreate"> {
    constructor();
    protected execute(guild: Guild): Promise<void>;
}
