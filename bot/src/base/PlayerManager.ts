import type { Client } from "discord.js"
import { GuildPlayerInstance } from "./GuildPlayerInstance.js"
import { Logger } from "./Logger.js"

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
                    player.updateChannelId(newState.channelId)
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

    public getOrCreate(guildId: string, textChannelId: string) {
        let player = this.players.get(guildId)
        const replyChannel = this.replyChannels.get(guildId)

        if (!player) {
            player = this.createPlayer(guildId)
        }

        // update reply channel to last used channel
        if (!replyChannel || replyChannel !== textChannelId) {
            this.replyChannels.set(guildId, textChannelId)
        }

        return player
    }

    private remove(guildId: string): void {
        const player = this.players.get(guildId);
        if (player) {
            player.tryDisconnect();
            this.players.delete(guildId);
            this.replyChannels.delete(guildId)
        }
        this.logger.log(`Removed player for guild: [${guildId}]`)
    }

    private createPlayer(guildId: string) {
            const player = new GuildPlayerInstance(guildId)
            this.players.set(guildId, player)
            this.logger.log(`Added player for guild: [${guildId}]`)

            // setup listener for new player

            // todo button on error with skip this song?
            player.on("error", () => {
                const channel = this.replyChannels.get(guildId)
            })

            player.on("playingNewTrack", (cause) => {
                const channel = this.replyChannels.get(guildId)
            })

            player.on("queueEnd", (cause) => {
                const channel = this.replyChannels.get(guildId)
            })

            return player
    }
}