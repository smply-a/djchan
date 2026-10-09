import { ButtonInteraction, ButtonStyle } from "discord.js";
import { Button, ComponentManager } from "../../base/Components.js";
import { type Paginators } from "../../base/Paginators.js";
import { Emoji } from "../../constants.js";

class Navigate<Paginator extends Paginators> extends Button<Paginator> {
    constructor(private direction: "left" | "right", context: {paginator: Paginator, manager: ComponentManager}) {
        const emoji = direction === "left" ? Emoji.arrow_left : Emoji.arrow_right
        const disabled = direction === "left" ? context.paginator.isMostLeft : context.paginator.isMostRight

        super({
            data: {
                style: ButtonStyle.Secondary,
                emoji,
                disabled
            },
        }, {...context, data: context.paginator}) 
    }

    public async execute(interaction: ButtonInteraction, paginator: Paginator) {
        await paginator.refresh(interaction)

        const index = this.direction === "left" ? Math.max(paginator.index - 1, 0) : paginator.index + 1

        await interaction.update(paginator.getReply(index))
    }
}



export class NavigateRight<Paginator extends Paginators> extends Navigate<Paginator> {
    constructor(context: {paginator: Paginator, manager: ComponentManager}) {
        super("right", context)
    }
}

export class NavigateLeft<Paginator extends Paginators> extends Navigate<Paginator> {
    constructor(context: {paginator: Paginator, manager: ComponentManager}) {
        super("left", context)
    }
}