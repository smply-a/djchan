import type { Awaitable, ClientEvents, RepliableInteraction } from "discord.js";
import { Logger } from "./Logger.js";

export abstract class Event<T extends keyof ClientEvents = keyof ClientEvents> {
    constructor(public readonly name: T, public readonly once: boolean = false) {}
    protected abstract execute(...args: ClientEvents[T]): Awaitable<void>

    // lazy init
    #logger?: Logger
    protected get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "event",
            origin: this.name
        })
    }

    // Error catching
    public async run(...args: ClientEvents[T]): Promise<void> {
        try {
            await this.execute(...args)
        } catch (error) {
            this.logger.log(error)
        }
    }

    protected async deleteReply(seconds: number, interaction: RepliableInteraction) {
        setTimeout(() => {
            void interaction.deleteReply().catch(()=>{})
        }, seconds * 1000)
    }
}