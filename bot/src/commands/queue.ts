// todo queue verwaltung. current

import { ApplicationCommandType, type CacheType, ChatInputCommandInteraction } from "discord.js"
import { Command } from "../base/Command.js"
import { QueuePaginator } from "../base/Paginators.js"

export class Queue extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "queue",
            type: ApplicationCommandType.ChatInput,
            description: "show the current queue"
        })
    }

    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        await interaction.deferReply()
        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        const pagination = new QueuePaginator(player.state, interaction.client.componentManager)
        
        interaction.editReply(pagination.getReply())
    }
}