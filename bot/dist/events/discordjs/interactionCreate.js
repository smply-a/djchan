import { ChatInputCommandInteraction, MessageFlags, TextDisplayBuilder } from "discord.js";
import { Event } from "../../base/Event.js";
import { InternalError, PublicError } from "../../types/PublicErrors.js";
// Handles all interactions
export class InteractionCreate extends Event {
    constructor() {
        super("interactionCreate");
    }
    async execute(interaction) {
        // dont allow commands in dms
        if (!interaction.guild) {
            // TODO
            if (interaction.isRepliable()) {
                await interaction.reply({
                    components: [new TextDisplayBuilder().setContent("Sorry, I am only working in guilds :/")],
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                });
            }
            return;
        }
        try {
            if (interaction.isChatInputCommand()) {
                await this.handleSlashCommand(interaction);
            }
        }
        catch (error) {
            this.logger.error(error);
            await this.handleUnhandeledError(error, interaction);
        }
    }
    async handleSlashCommand(interaction) {
        const name = interaction.commandName;
        const command = interaction.client.commands.get(name);
        if (!command) {
            throw new Error(`command: [${name}] not found`);
        }
        try {
            await command.run(interaction);
        }
        catch (error) {
            command.logger.error(error);
            await this.handleSlashCommandError(error, interaction);
        }
    }
    // TODO
    async handleUnhandeledError(error, interaction) {
    }
    async handleSlashCommandError(error, interaction) {
        // default error message
        let payload = new InternalError().getReply();
        if (error instanceof PublicError) {
            payload = error.getReply();
        }
        // send error message
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(payload);
        }
        else {
            await interaction.reply(payload);
        }
        // delete message after 5 minutes
        this.deleteReply(5 * 60, interaction);
    }
}
