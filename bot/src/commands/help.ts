import { ApplicationCommandType, ChatInputCommandInteraction, type CacheType } from "discord.js";
import { Command } from "../base/Command.js";
import { mainHelpreply } from "../components/replies/help.js";

export class Help extends Command<ApplicationCommandType.ChatInput> {
    constructor() {
        super({
            name: "help",
            type: ApplicationCommandType.ChatInput,
            description: "shows all commands with an explaination"
        }, {
            group: "general",
            description: "shows this message",
            syntax: "/help"
        })
    }
    protected async execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const commands = interaction.client.commands
        const help = commands.get("help")
        const ping = commands.get("ping")

        const manager = interaction.client.componentManager

        if (!help || !ping) throw new Error("Coulndt find help or ping command")
        
        const musicCommands = Array.from(commands.filter(command => command.info.group === "music").values())

        await interaction.reply(mainHelpreply({manager, help, ping, musicCommands}))
    }
}