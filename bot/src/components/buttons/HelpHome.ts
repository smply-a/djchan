import { ButtonInteraction, ButtonStyle } from "discord.js"
import { Button, ComponentManager } from "../../base/Components.js"
import { Emoji } from "../../constants.js"
import { mainHelpreply } from "../replies/help.js"

export class HelpHome extends Button<null> {
    constructor(context: {manager: ComponentManager}) {

        super({
            data: {
                style: ButtonStyle.Secondary,
                emoji: Emoji.home
            },
        }, {...context, data: null}) 
    }

    public async execute(interaction: ButtonInteraction) {
        const commands = interaction.client.commands
        const help = commands.get("help")
        const ping = commands.get("ping")

        const manager = interaction.client.componentManager

        if (!help || !ping) throw new Error("Coulndt find help or ping command")
        
        const musicCommands = Array.from(commands.filter(command => command.info.group === "music").values())
    
        this.invalidate()
        await interaction.update(mainHelpreply({manager, help, ping, musicCommands}))     
    }
}