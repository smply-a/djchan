import type { Awaitable, ChatInputCommandInteraction, ClientEvents } from "discord.js";
import { Logger } from "./Logger.js";
export declare abstract class Event<T extends keyof ClientEvents = keyof ClientEvents> {
    #private;
    readonly name: T;
    readonly once: boolean;
    constructor(name: T, once?: boolean);
    protected abstract execute(...args: ClientEvents[T]): Awaitable<void>;
    protected get logger(): Logger;
    run(...args: ClientEvents[T]): Promise<void>;
    protected deleteReply(seconds: number, interaction: ChatInputCommandInteraction): Promise<void>;
}
