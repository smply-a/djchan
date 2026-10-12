import type { Track } from "@app/player";
import { ButtonInteraction, ButtonStyle, type InteractionButtonComponentData } from "discord.js";
import type { ComponentManager } from "../../base/Components.js";
import { Button } from "../../base/Components.js";
import { SearchError, TrackError } from "../../base/GuildPlayerInstance.js";
import { ComponentExpired } from "../../base/PublicErrors.js";
import { Duration, Emoji } from "../../constants.js";
import { deleteReply } from "../../utils.js";
import { MusicReplies } from "../replies/music.js";


class InsertTrack extends Button<Track> {
    constructor(private index: number, button: Omit<InteractionButtonComponentData, "customId" | "type">, context: {manager: ComponentManager, data: Track}) {
        super({data: button}, context)
    }

    protected async execute(interaction: ButtonInteraction, track: Track): Promise<void> {
        await interaction.deferUpdate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)
        const manager = interaction.client.componentManager

        const currentIndex = player.getTrackIndex(track)
        // invalidate themself
        if (currentIndex <= this.index) {
            this.invalidate()
            throw new ComponentExpired()
        }

        player.deleteTrack(currentIndex)
        try {
            await player.insertTrack(track, this.index)
            const reply = await interaction.followUp(MusicReplies.move(track, currentIndex, this.index))

            deleteReply(Duration.tempMessages, reply)
        
        } catch (error) {
            if (error instanceof TrackError) {
                const reply = await interaction.editReply(MusicReplies.trackError(error, manager))
                deleteReply(Duration.tempMessages, reply)
                return
            }

            throw error
        }
    }
}

export class PlayNext extends InsertTrack {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super(1, {
            label: "play next",
            emoji: Emoji.queued_next,
            style: ButtonStyle.Secondary
        }, context)
    }
}

export class PlayNow extends InsertTrack {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super(0, {
            label: "play",
            emoji: Emoji.play,
            style: ButtonStyle.Secondary
        }, context)
    }
}



export class RetryPlay extends Button<Track> {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super({data: {
            emoji: Emoji.retry,
            style: ButtonStyle.Secondary
        }}, context)
    }

    protected async execute(interaction: ButtonInteraction, track: Track): Promise<void> {
        await interaction.deferUpdate()

        this.invalidate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)
        const manager = interaction.client.componentManager

        interaction.editReply(MusicReplies.request({state: "result", track}))


        try {
            await player.insertTrack(track, "now")
            const reply = await interaction.editReply(MusicReplies.start(track, manager))
        
        } catch (error) {
            if (error instanceof TrackError) {
                const reply = await interaction.editReply(MusicReplies.trackError(error, manager))
                deleteReply(Duration.tempMessages, reply)
                return
            }

            throw error
        }
    }
}

export class RetrySearch extends Button<string> {
    constructor(context: {manager: ComponentManager, data: string}) {
        super({ 
            data: {
                emoji: Emoji.retry,
                style: ButtonStyle.Secondary
            }
        }, context)
    }

    protected async execute(interaction: ButtonInteraction, query: string): Promise<void> {
        await interaction.deferUpdate()

        this.invalidate()
        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)
        const manager = interaction.client.componentManager

        await interaction.editReply(MusicReplies.request({state: "searching", query}))

        try {
            const track = await player.search(query)

            // await interaction.editReply(MusicReplies.request({state: "result", track}))


            const result = await player.addTrack(track)

            if (result.inQueue) {
                await interaction.editReply(MusicReplies.queued(track, result.index, manager))
            } else {
                await interaction.editReply(MusicReplies.start(track, manager))
            }
        
        } catch (error) {
            if (error instanceof TrackError) {
                const reply = await interaction.editReply(MusicReplies.trackError(error, manager))
                deleteReply(Duration.tempMessages, reply)
                return
            }

            if (error instanceof SearchError) {
                const reply = await interaction.editReply(MusicReplies.searchError(error, manager))
                deleteReply(Duration.tempMessages, reply)
                return
            }
            // re throw unkown error
            throw error
        }
    }
}

export class RemoveFromQueue extends Button<Track> {
    constructor(context: {manager: ComponentManager, data: Track}) {
        super({ 
            data: {
                label: "delete",
                emoji: Emoji.delete,
                style: ButtonStyle.Danger
            }
        }, context)
    }

    protected async execute(interaction: ButtonInteraction, track: Track): Promise<void> {
        await interaction.deferUpdate()
        this.invalidate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)

        const index = player.getTrackIndex(track)

        // invalidate if not in queue or playing
        if (index < 0) {
            throw new ComponentExpired()
        }

        player.deleteTrack(index)

        const reply = await interaction.editReply(MusicReplies.removeQueue())

        deleteReply(Duration.tempMessages, reply)

    }
}

export class Skip extends Button<Track> {
    constructor(private mode: "bindTrack" | "normal", context: {manager: ComponentManager, data: Track}) {
        super({
            data: {
                style: ButtonStyle.Secondary,
                label: "skip",
                emoji: Emoji.skipNext
            },
    }, context)
    }

    protected async execute(interaction: ButtonInteraction, nextTrack: Track): Promise<void> {
        await interaction.deferUpdate()

        const {player, guildId} = await interaction.client.players.getPlayerGuarded(interaction)
        const state = await player.getState()

        if (this.mode == "bindTrack") {
            this.invalidate()
            if (state.queue[0] && state.queue[0].uuid !== nextTrack.uuid) {
                throw new ComponentExpired()
            }
        }

        try {
            const newTrack = await player.skip()

            const reply = await interaction.editReply(MusicReplies.skipped(newTrack))
            
            deleteReply(Duration.tempMessages, reply)
        
        } catch (error) {
            if (error instanceof TrackError) {
                const reply = await interaction.editReply(MusicReplies.trackError(error, interaction.client.componentManager))
                deleteReply(Duration.tempMessages, reply)
                return
            }

            // re throw unkown
            throw error
        }
    }
}