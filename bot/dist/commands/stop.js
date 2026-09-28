import { ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import stopReply from "../components/replies/stopReply.js";
export class Stop extends Command {
    constructor() {
        super({
            name: "stop",
            type: ApplicationCommandType.ChatInput,
            description: "stops stream and clears queue"
        });
    }
    async execute(interaction) {
        await interaction.reply(stopReply({ state: "loading" }));
        const player = await interaction.client.players.getPlayerGuarded(interaction);
        player.stop();
        await interaction.editReply(stopReply({ state: "stopped" }));
    }
}
