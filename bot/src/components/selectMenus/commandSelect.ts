import { type StringSelectMenuInteraction } from "discord.js"
import type { Command } from "../../base/Command.js"
import { ComponentManager, StringSelect } from "../../base/Components.js"
import { detailedHelpReply } from "../replies/help.js"

export class CommandSelect extends StringSelect<Command[]> {
    constructor(context: { manager: ComponentManager, data: Command[] }) {

        const options = context.data.map((command) => ({
            label: `/${command.data.name}`, 
            value: command.data.name, 
        }))

        super({
            data: {
                placeholder: "select command for detailed info",
                options
            }
        }, context)
    }

    protected async execute(interaction: StringSelectMenuInteraction, commands: Command[]): Promise<void> {
        const name = interaction.values[0]

        const command = commands.find(cmd => cmd.data.name === name)
        const manager = interaction.client.componentManager

        this.invalidate()
        await interaction.update(detailedHelpReply({manager, allCommands: commands, targetCommand: command}))
    }
}