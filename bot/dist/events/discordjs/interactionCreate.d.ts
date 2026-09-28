import { type Interaction } from "discord.js";
import { Event } from "../../base/Event.js";
export declare class InteractionCreate extends Event<"interactionCreate"> {
    constructor();
    protected execute(interaction: Interaction): Promise<void>;
    private handleSlashCommand;
    private handleUnhandeledError;
    private handleSlashCommandError;
}
