import { ChatInputCommandInteraction, MessageFlags, TextDisplayBuilder, type Interaction } from "discord.js";
import { Event } from "../../base/Event.js";
import { InternalError, PublicError } from "../../types/PublicErrors.js";

// Handles all interactions
export class InteractionCreate extends Event<"interactionCreate"> {
    constructor() {
        super("interactionCreate")
    }

    public async run(interaction: Interaction): Promise<void> {
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
            }
        } catch (error) {
            this.logger.error(error)
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
            await this.handleSlashCommandError(error, interaction)
        }
    }

    // TODO
    private async handleUnhandeledError(error: unknown, interaction: Interaction) {

    }

    private async handleSlashCommandError(error: unknown, interaction: ChatInputCommandInteraction) {
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
        setTimeout(() => {
            void interaction.deleteReply().catch(()=>{})
        }, 5*60_000)
    }
}