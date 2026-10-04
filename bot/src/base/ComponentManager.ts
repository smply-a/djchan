import type { ButtonInteraction } from "discord.js";
import type { Button } from "./Components.js";

export class ComponentManager {
    private buttons = new Map<string, {button: Button<unknown>, context: unknown, timeout: NodeJS.Timeout}>()

    //todo make for any compoennt 
    register<T>(button: Button<T>, context: T) {
        //prevent memory leak
        const timeout = setTimeout(() => {
            this.buttons.delete(button.customId)
        }, 15 * 60 * 1000)

        timeout.unref()

        this.buttons.set(button.customId, {button, context, timeout})
    }

    delete(button: Button<unknown>) {
        const entry = this.buttons.get(button.customId);
        if (entry) {
            clearTimeout(entry.timeout);
            this.buttons.delete(button.customId);
        }
    }

    async handleButton(interaction: ButtonInteraction) {
        const id = interaction.customId

        const entry = this.buttons.get(id)

        // todo gebe user einen fehler von wegen button outdated
        if (!entry) throw new Error ("Button is not in active Component Registry")

        await entry.button.run(interaction, entry.context)
    }
}