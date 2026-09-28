import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import { StaticButton } from "../../base/Button.js";
export class PlayNow extends StaticButton {
    constructor() {
        super({
            type: ComponentType.Button,
            label: "resume",
            customId: "resume",
            style: ButtonStyle.Primary,
        });
    }
    async execute(interaction) {
        interaction.reply("resuming");
        // todo
        interaction.editReply("succesfully resumed");
    }
}
