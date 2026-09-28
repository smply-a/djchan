import { ButtonInteraction, type InteractionButtonComponentData } from "discord.js";
import { Logger } from "./Logger.js";
export declare abstract class StaticButton {
    #private;
    readonly data: InteractionButtonComponentData;
    get logger(): Logger;
    constructor(data: InteractionButtonComponentData);
    protected abstract execute(interaction: ButtonInteraction): Promise<void>;
    run(interaction: ButtonInteraction): Promise<void>;
}
