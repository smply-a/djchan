import { ChatInputCommandInteraction, MessageComponentInteraction, MessageFlags, TextDisplayBuilder, type Interaction, type RepliableInteraction } from "discord.js";
import { Event } from "../../base/Event.js";
import { InternalError, PublicError } from "../../base/PublicErrors.js";

// Handles all interactions
export class InteractionCreate extends Event<"interactionCreate"> {
    constructor() {
        super("interactionCreate")
    }

    protected async execute(interaction: Interaction): Promise<void> {
        const {client} = interaction

        // dont allow commands in dms
        if (!interaction.guild) {
            // TODO
            if (interaction.isRepliable()) {
                await interaction.reply({
                    components: [new TextDisplayBuilder().setContent("Sorry, I am only working in guilds :/")],
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                })
            }
            return
        }

        try {
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction)
                return
            }

            if (interaction.isMessageComponent()) {
                await this.handleComponent(interaction)
                return
            }
        } catch (error) {
            await this.handleUnhandeledError(error, interaction)
        }
    }

    private async handleSlashCommand(interaction: ChatInputCommandInteraction) {
        const name = interaction.commandName
        const command = interaction.client.commands.get(name)
        if (!command) {
            throw new Error(`command: [${name}] not found`)
        }
        
        try {
            await command.run(interaction)

        } catch (error) {
            command.logger.error(error)
            
            // default error message
            let payload = new InternalError().getReply()

            if (error instanceof PublicError) {
                payload = error.getReply()
            }

            // send error message
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(payload)
            }
            else {
                await interaction.reply(payload)
            }

            // delete message after 5 minutes
            this.deleteReply(5*60, interaction)
        }
    }

    private async handleComponent(interaction: RepliableInteraction & MessageComponentInteraction) {
        try {
            await interaction.client.componentManager.handleComponent(interaction)
            
        } catch (error) {
            this.logger.error(error)

            // default error message
            let payload = new InternalError().getReply()

            if (error instanceof PublicError) {
                payload = error.getReply()
            }

            // send error message
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(payload)
            }
            else {
                await interaction.reply(payload)
            }

            // delete message after 5 minutes
            this.deleteReply(5*60, interaction)
        }
    }

    // TODO
    private async handleUnhandeledError(error: unknown, interaction: Interaction) {
        this.logger.error(error)

        const payload = new InternalError().getReply()

        // send error message
        if (interaction.isRepliable()) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(payload)
            }
            else {
                await interaction.reply(payload)
            }
        }
    }
}