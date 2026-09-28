import { Client, Collection, type ClientOptions } from "discord.js";
import type { Command } from "./base/Command.js";
import type { Event } from "./base/Event.js";
import { Logger } from "./base/Logger.js";
export default class BotClient extends Client {
    commands: Collection<string, Command>;
    events: Collection<string, Event>;
    logger: Logger;
    constructor(options: ClientOptions);
    start({ token, commands, events }: {
        token: string;
        commands?: (new () => Command)[];
        events?: (new () => Event)[];
    }): Promise<void>;
    login(token: string): Promise<string>;
    private loadEvents;
    private loadCommands;
}
