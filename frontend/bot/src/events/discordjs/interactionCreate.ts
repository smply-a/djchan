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
            this.logger.log(error)
            await this.handleError(interaction)
        }

    }

    private async handleSlashCommand(interaction: ChatInputCommandInteraction) {
        const name = interaction.commandName
        const command = interaction.client.commands.get(name)
        if (!command) {
            throw new Error(`command: [${name}] not found`)
        }

        return command.execute(interaction)
    }

    // TODO
    private async handleError(interaction: Interaction) {

    }
}