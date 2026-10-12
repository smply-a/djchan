// todo queue verwaltung. current

import { ApplicationCommandType, type CacheType, ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { Command } from "../base/Command.js"
import { QueuePaginator } from "../base/Paginators.js"

export class Queue extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "queue",
            type: ApplicationCommandType.ChatInput,
            description: "show the current queue"
        }, {
            group: "music",
            description: "show the current queue",
            syntax: "/queue"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })
        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        const pagination = new QueuePaginator(await player.getState(), interaction.client.componentManager)
        
        interaction.editReply(pagination.getReply())
    }
}