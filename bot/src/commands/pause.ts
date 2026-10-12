import { ApplicationCommandType, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../base/Command.js";
import { MusicReplies } from "../components/replies/music.js";
import { Duration } from "../constants.js";
import { deleteReply } from "../utils.js";


export class Pause extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "pause",
            type: ApplicationCommandType.ChatInput,
            description: "pauses stream"
        }, {
            group: "music",
            description: "pauses stream",
            syntax: "/pause"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply()
        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        const track = player.pause()
        const reply = await interaction.editReply(MusicReplies.pause(interaction.client.componentManager))

        deleteReply(Duration.tempMessages, reply)
    }
}