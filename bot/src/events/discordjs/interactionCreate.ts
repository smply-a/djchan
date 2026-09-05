import { ChatInputCommandInteraction, type Interaction } from "discord.js";
import { Event } from "../../base/Event.js";

// Handles all interactions
export class InteractionCreate extends Event<"interactionCreate"> {
    constructor() {
        super("interactionCreate")
    }

    public async run(interaction: Interaction): Promise<void> {
        try {
            if (!interaction.guild) return

            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction)
            }
        } catch (error) {
            await this.handleError(error, interaction)
        }

    }

    // todo add error to logger
    private async handleSlashCommand(interaction: ChatInputCommandInteraction) {
        const name = interaction.commandName
        const command = interaction.client.commands.get(name)
        if (!command) {
            throw new Error(`command: [${name}] not found`)
        }
        
        try {
            await command.run(interaction)
        } catch (error) {
            command.logger.log(error)

            switch (error) {
            
            }
        }
        
    }

    // TODO
    private async handleError(error: unknown, interaction: Interaction) {
        this.logger.log(error)
    }
}