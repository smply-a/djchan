import { ApplicationCommandType } from "discord.js";
import { Command } from "../base/Command.js";
import pauseReply from "../components/replies/pauseReply.js";
export class Pause extends Command {
    constructor() {
        super({
            name: "pause",
            type: ApplicationCommandType.ChatInput,
            description: "pauses stream"
        });
    }
    async execute(interaction) {
        await interaction.reply(pauseReply({ state: "loading" }));
        const player = await interaction.client.players.getPlayerGuarded(interaction);
        const track = player.pause();
        await interaction.editReply(pauseReply({ state: "paused", track }));
        this.deleteReply(60, interaction);
    }
}
