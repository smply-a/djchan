import { ButtonInteraction, ChatInputCommandInteraction, MessageFlags, type Client, type MessageCreateOptions, type VoiceBasedChannel } from "discord.js";
import type { ReplyPayload } from "../types/index.js";
import { GuildPlayerInstance } from "./GuildPlayerInstance.js";
import { Logger } from "./Logger.js";
import { CLientNotConnected, MemberNotConnected, MemberNotInSameChannel, OnlyInCachedGuild } from "./PublicErrors.js";

type PlayerInteraction = ChatInputCommandInteraction | ButtonInteraction;

export class PlayerManager {
    private players = new Map<string, GuildPlayerInstance>()
    private replyChannels = new Map<string, string>()

    #logger?: Logger
    public get logger(): Logger {
        return this.#logger ??= new Logger({
            type: "internal",
            origin: "player manager"
        })
    }

    constructor(private client: Client) {
        this.client.on("voiceStateUpdate", (oldState, newState) => {
            const botId = this.client.user?.id
            if (!botId) return

            const guildId = oldState.guild.id
            const player = this.players.get(guildId)
            if(!player) return
            

            // update bot on change
            if (oldState.member?.id === botId) {
                // remove if disconnected
                if (!newState.channelId) {
                    this.remove(guildId);
                    return
                }

                // update channelId when moved
                if (oldState.channelId !== newState.channelId) {
                    player.setNewChannelId(newState.channelId)
                }
            }

            // ? confusion weil old vs newstate
            // leave on empty
            const voiceChannel = oldState.channel;
            if (voiceChannel && voiceChannel.members.has(botId)) {
                const humanMembers = voiceChannel.members.filter(m => !m.user.bot);
                if (humanMembers.size === 0) {
                    this.logger.log("bot left empty channel")
                    this.remove(guildId)
                }
            }
        })
    }

    // makes sure that the user has the privileges to acces the player
    public async getPlayerGuarded(interaction: PlayerInteraction) {
        const {player, userVc, guildId} = this.getGuardParams(interaction)
        
        if (!player) throw new CLientNotConnected()

        await player.ready()
        if (player.getChannelId() !== userVc.id) throw new MemberNotInSameChannel()

        return {player, guildId}
    }

    // makes sure that the user has the privileges to acces the player
    public async getOrCreateGuarded(interaction: PlayerInteraction) {
        const {player, userVc, guildId} = this.getGuardParams(interaction)
        
        if (player) {
            await player.ready()
            if (player.getChannelId() !== userVc.id) throw new MemberNotInSameChannel()
        
            return {player, guildId}
        }

        const newPlayer = this.createPlayer(guildId, userVc, interaction.channelId);
        await newPlayer.ready()
        
        return {player: newPlayer, guildId}
    }



    // get arguments for the guarded functions
    private getGuardParams(interaction: PlayerInteraction) {
        if (!interaction.inCachedGuild()) throw new OnlyInCachedGuild()
        
        const userVc = interaction.member.voice.channel;
        if (!userVc) throw new MemberNotConnected()

        return {
            player: this.get(interaction.guild.id, interaction.channelId),
            userVc,
            guildId: interaction.guild.id
        }
    }

    private get(guildId: string, textChannelId: string) {
        const player = this.players.get(guildId)

        if (!player) {
            return null
        }

        this.setReplyChannel(guildId, textChannelId)
        return player
    }

    private setReplyChannel(guildId: string, textChannelId: string) {
        const replyChannel = this.replyChannels.get(guildId)
        if (!replyChannel || replyChannel !== textChannelId) {
            this.replyChannels.set(guildId, textChannelId)
        }
    }

    private remove(guildId: string): void {
        this.players.get(guildId)?.tryDisconnect();
    }

    // todo events
    private createPlayer(guildId: string, vc: VoiceBasedChannel, textChannelId: string) {
        const player = new GuildPlayerInstance(guildId, vc)
        this.players.set(guildId, player)
        this.setReplyChannel(guildId, textChannelId)
        this.logger.log(`Added player for guild: [${guildId}]`)

        // todo button on error with skip this song?
        // setup listener for new player
        player.on("error", () => {
            const channelId = this.replyChannels.get(guildId)
        })

        player.on("disconnected", () => {
            this.players.delete(guildId);
            this.replyChannels.delete(guildId)
            player.removeAllListeners()
            this.logger.log(`Removed player for guild: [${guildId}]`)
        })

        player.on("playingNewTrack", (cause) => {
            const channelId = this.replyChannels.get(guildId)

            // remove buttons from component handling when player queue updates
            // todo invalidate components 

            if (cause === "command") return

            // only handle noninteraction events
        })

        player.on("queueEnd", (cause) => {
            const channelId = this.replyChannels.get(guildId)
            if (cause === "command") return

            // only handle noninteraction events
        })

        return player
    }

    private async sendMessage(channelId: string | undefined, message: ReplyPayload) {
        if (!channelId) {
            throw new Error("Could not react to error in Playermanager event listener")
        }
        
        const channel = await this.client.channels.fetch(channelId)

        if (!channel || !channel.isSendable()) throw new Error("could not get valid reply channel for player manager messages")

        // cannot send ephemeral
        const payload: MessageCreateOptions = {
            ...message,
            flags: MessageFlags.IsComponentsV2
        }
        channel.send(payload)
    }
}