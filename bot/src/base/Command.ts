import { type ApplicationCommandType, type Awaitable, type ChatInputApplicationCommandData, type ChatInputCommandInteraction, type MessageApplicationCommandData, type MessageContextMenuCommandInteraction, type PrimaryEntryPointCommandData, type PrimaryEntryPointCommandInteraction, type UserApplicationCommandData, type UserContextMenuCommandInteraction } from "discord.js";
import { CLientNotConnected, MemberNotConnected, MemberNotInSameChannel, OnlyInCachedGuild } from "../types/index.js";
import type { GuildPlayerInstance } from "./GuildPlayerInstance.js";
import { Logger } from "./Logger.js";

type CommandTypeMap = {
    [ApplicationCommandType.ChatInput]: {
        data: ChatInputApplicationCommandData
        interaction: ChatInputCommandInteraction
    },
    [ApplicationCommandType.Message]: {
        data: MessageApplicationCommandData,
        interaction: MessageContextMenuCommandInteraction
    }, 
    [ApplicationCommandType.User]: {
        data: UserApplicationCommandData,
        interaction: UserContextMenuCommandInteraction,
    },
    [ApplicationCommandType.PrimaryEntryPoint]: {
        data: PrimaryEntryPointCommandData,
        interaction: PrimaryEntryPointCommandInteraction,
    }

}

export abstract class Command<T extends keyof CommandTypeMap = keyof CommandTypeMap> {
    constructor(
        public readonly data: CommandTypeMap[T]["data"] & {type: T}
    ) {}
    // to make command clickable in help
    public id?: string

    // for visualisation and help
    //public icon:


    // implementation of command
    protected abstract execute(interaction: CommandTypeMap[T]["interaction"]): Awaitable<void>

    // filter 
    public async run(interaction: CommandTypeMap[T]["interaction"]) {
        await this.execute(interaction)
    }

    // lazy init
    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "command",
            origin: this.data.name
        })
    }

    // utils
    protected getPlayerAccess(interaction: ChatInputCommandInteraction) {
        const {player, userVc} = this.getPlayer(interaction)
        if (!player) throw new CLientNotConnected()

        this.ensureSameChannel(player, userVc.id)
        return player
    }

    protected getOrCreatePlayerAccess(interaction: ChatInputCommandInteraction) {
        let {player, userVc, guildId} = this.getPlayer(interaction)
        
        if (player) {
            this.ensureSameChannel(player, userVc.id)
        } else {
            player = interaction.client.players.getOrCreate(guildId, interaction.channelId);
        }
        
        return { player, userVc }
    }

    protected ensureSameChannel(player: GuildPlayerInstance, userChannelId: string) {
        if (player.getChannelId() !== userChannelId) throw new MemberNotInSameChannel()
    }

    private getPlayer(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) throw new OnlyInCachedGuild()
        
        const userVc = interaction.member.voice.channel;
        if (!userVc) throw new MemberNotConnected()

        return {
            player: interaction.client.players.get(interaction.guild.id, interaction.channelId),
            userVc,
            guildId: interaction.guild.id
        }
    }
}
