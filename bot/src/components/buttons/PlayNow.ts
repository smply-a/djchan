import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle, ComponentType } from "discord.js";
import { Button } from "../../base/Button.js";
import type { GuildPlayerInstance } from "../../base/GuildPlayerInstance.js";
import { InternalError } from "../../types/PublicErrors.js";

export class PlayNow extends Button<{player: GuildPlayerInstance, track: Track}>{
    constructor() {
        super({
            type: ComponentType.Button,
            label: "play now",
            customId: "play_now",
            style: ButtonStyle.Primary,
        })
    }

    protected async execute(interaction: ButtonInteraction, args: {player: GuildPlayerInstance, track: Track}): Promise<void> {
        interaction.reply("inserting")
        const {player} = args

        player.insert(args.track, 0)
        const track = player.skip()

        if (!track) throw new InternalError()
        
        interaction.editReply("succesfully inserted")
    }
}