import type { Client } from "discord.js"
import { GuildPlayerInstance } from "./base/GuildPlayerInstance.js"
import { Logger } from "./base/Logger.js"

export class PlayerManager {
    private players = new Map<string, GuildPlayerInstance>()

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
            
            // remove if disconnected
            if (oldState.member?.id === botId && oldState.channelId && !newState.channelId) {
                this.remove(guildId);
                return;
            }

            // leave on empty
            const voiceChannel = newState.channel;
            if (voiceChannel && voiceChannel.members.has(botId)) {
                const humanMembers = voiceChannel.members.filter(m => !m.user.bot);
                if (humanMembers.size === 0) {
                    this.remove(guildId);
                }
                return
            }
        })
    }

    public getOrCreate(guildId: string) {
        let player = this.players.get(guildId)

        if (!player) {
            player = new GuildPlayerInstance(guildId)

            this.players.set(guildId, player)
        }

        return player
    }

    public remove(guildId: string): void {
        const player = this.players.get(guildId);
        if (player) {
            player.disconnect();
            this.players.delete(guildId);
        }
        this.logger.log(`Removed player for guild: [${guildId}]`)
    }
}