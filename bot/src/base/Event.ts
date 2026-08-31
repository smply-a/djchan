import type { Awaitable, ClientEvents } from "discord.js";
import { Logger } from "./Logger.js";

export abstract class Event<T extends keyof ClientEvents = keyof ClientEvents> {
    constructor(public readonly name: T, public readonly once: boolean = false) {}
    protected abstract run(...args: ClientEvents[T]): Awaitable<void>

    // lazy init
    #logger?: Logger
    protected get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "event",
            origin: this.name
        })
    }

    // Error catching
    public async execute(...args: ClientEvents[T]): Promise<void> {
        try {
            await this.run(...args)
        } catch (error) {
            this.logger.log(error)
        }
    }
}