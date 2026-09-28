import { ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import nowPlaying from "../components/replies/nowPlaying.js";
import queueEmpty from "../components/replies/queueEmpty.js";
import skipped from "../components/replies/skipped.js";
export class Skip extends Command {
    constructor() {
        super({
            name: "skip",
            type: ApplicationCommandType.ChatInput,
            description: "skips stream"
        });
    }
    async execute(interaction) {
        await interaction.reply(skipped({ state: "loading" }));
        const player = await interaction.client.players.getPlayerGuarded(interaction);
        const track = player.skip();
        if (!track) {
            interaction.editReply(queueEmpty());
            return;
        }
        await interaction.editReply(nowPlaying({ state: "skipped", track }));
    }
}
