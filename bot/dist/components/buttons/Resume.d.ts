import { ButtonInteraction } from "discord.js";
import { StaticButton } from "../../base/Button.js";
export declare class PlayNow extends StaticButton {
    constructor();
    protected execute(interaction: ButtonInteraction): Promise<void>;
}
