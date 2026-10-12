import type { Track } from "@app/player"
import { getDurationString, viewString } from "@app/shared"
import { AudioPlayerStatus } from "@discordjs/voice"
import {
    ActionRowBuilder, ComponentType, ContainerBuilder, SectionBuilder, SeparatorBuilder,
    SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder, type MessageActionRowComponentBuilder,
} from "discord.js"
import type { ComponentManager } from "../../base/Components.js"
import { SearchError, type TrackError } from "../../base/GuildPlayerInstance.js"
import { QueuePaginator, type ReplyPayload } from "../../base/Paginators.js"
import { Color, defaultReplyFlags, Emoji, ephemeralReplyFlags } from "../../constants.js"
import { NavigateLeft, NavigateRight } from "../buttons/Navigation.js"
import { Resume } from "../buttons/Playback.js"
import { PlayNext, PlayNow, RemoveFromQueue, RetryPlay, RetrySearch, Skip } from "../buttons/Queue.js"

export const MusicReplies = {
    start: (track: Track, manager: ComponentManager) =>
        trackChangeReply({ action: "start", track, manager }),

    queued: (track: Track, index: number, manager: ComponentManager) =>
        trackChangeReply({ action: "queue", track, index, manager }),

    move: (track: Track, oldIndex: number, newIndex: number) =>
        trackChangeReply({ action: "move", track, oldIndex, newIndex }),

    skipped: (track: Track | null) =>
        trackChangeReply({ action: "skip", track }),

    pause: (manager: ComponentManager) =>
        playbackReply({ action: "pause", manager }),

    resume: () => playbackReply({ action: "resume" }),
    stopped: () => playbackReply({ action: "stop" }),

    queue: renderQueuePaginator,
    request: songRequestReply,
    removeQueue: removeQueueReply,
    trackError: trackErrorReply,
    searchError: searchErrorReply,
}



function getBaseContainer(): ContainerBuilder {
    return new ContainerBuilder().setAccentColor(Color.bot)
}

function songInfoInline(track: Track): string {
    return `[${track.title}](${track.url})`
}

function songInfo(track: Track): SectionBuilder {
    const content = [
        `## [${track.title}](${track.url})`,
        `by ${track.interpret}   •   ${getDurationString(track.duration)}   •   ${viewString(track.view_count)} views`,
    ].join("\n")

    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
}



type TrackChangeArgs =
    | { action: "start"; track: Track; manager: ComponentManager }
    | { action: "skip"; track: Track | null }
    | { action: "queue"; track: Track; index: number; manager: ComponentManager }
    | { action: "move"; track: Track; oldIndex: number; newIndex: number }

function trackChangeReply(args: TrackChangeArgs): ReplyPayload {
    const container = getBaseContainer()

    switch (args.action) {
        case "start": {
            const { track, manager } = args
            const buttons = [new RemoveFromQueue({ manager, data: track }).component]

            container
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`### ${Emoji.play} playing`),
                )
                .addSectionComponents(songInfo(track))
                .addActionRowComponents(
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons),
                )
            break
        }

        case "skip": {
            const content = args.track
                ? `### ${Emoji.skipNext} skipped to ${songInfoInline(args.track)}`
                : "### Queue empty"

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
            break
        }

        case "queue": {
            const { track, index, manager } = args
            const buttons = [
                new PlayNow({ manager, data: track }).component,
                ...(index > 1 ? [new PlayNext({ manager, data: track }).component] : []),
                new RemoveFromQueue({ manager, data: track }).component,
            ]

            container
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`### ${Emoji.queued} queued \`${index}\``),
                )
                .addSectionComponents(songInfo(track))
                .addActionRowComponents(
                    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons),
                )
            break
        }

        case "move": {
            const { track, oldIndex, newIndex } = args
            const isPlaying = newIndex === 0
            const newPosition = isPlaying ? "now playing" : newIndex
            const emoji = isPlaying ? Emoji.play : Emoji.queued
            const content =
                `### ${emoji} position \`${oldIndex}\` ${Emoji.arrow_right} \`${newPosition}\`\n` +
                songInfoInline(track)

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
            break
        }
    }

    return { components: [container], flags: defaultReplyFlags }
}



type PlaybackArgs =
    | { action: "pause"; manager: ComponentManager }
    | { action: "resume" }
    | { action: "stop" }

function playbackReply(args: PlaybackArgs): ReplyPayload {
    const container = getBaseContainer()

    switch (args.action) {
        case "resume":
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${Emoji.play} resumed`),
            )
            break

        case "pause":
            container.addSectionComponents({
                type: ComponentType.Section,
                components: [{
                    type: ComponentType.TextDisplay,
                    content: `### ${Emoji.pause} paused`,
                }],
                accessory: new Resume({ manager: args.manager }).component.toJSON(),
            })
            break

        case "stop":
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${Emoji.stop} stopped`),
            )
            break
    }

    return { components: [container], flags: defaultReplyFlags }
}



type RequestArgs =
    | { state: "searching"; query: string }
    | { state: "result"; track: Track }

export function songRequestReply(args: RequestArgs): ReplyPayload {
    const container = getBaseContainer()

    switch (args.state) {
        case "searching":
            // TODO: Add a loading thumbnail and a cancel button.
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### ${Emoji.loading} searching\n\`${args.query}\``,
                ),
            )
            break

        case "result":
            container
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`### ${Emoji.loading} starting`),
                )
                .addSectionComponents(songInfo(args.track))
            break
    }

    return { components: [container], flags: defaultReplyFlags }
}



function renderQueuePaginator(
    paginator: QueuePaginator,
    manager: ComponentManager,
): ReplyPayload {
    const container = getBaseContainer()
    const { firstPage, list } = paginator.currentData

    const title = `### ${Emoji.queued} Queue Overview\n`

    if (firstPage) {
        const { status, track } = firstPage
        const state =
            status === AudioPlayerStatus.Buffering ? "buffering" :
            status === AudioPlayerStatus.Playing ? "playing" :
            status === AudioPlayerStatus.Idle ? "player is idle" :
            "paused"
        const currentTrack = track ? ` [${track.title}](${track.url})` : ""

        container
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${title}` + 
                    `\`${state}\`${currentTrack}\n`,
                ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setDivider().setSpacing(SeparatorSpacingSize.Small),
            )
    } else {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`${title}`),
        )
    }

    if (list.length === 0) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent("Queue empty"),
        )
    } else {
        const indexOffset = paginator.songsPerPage * paginator.index
        const queueContent = list
            .map((track, index) => `${index + 1 + indexOffset}. ${songInfoInline(track)}`)
            .join("\n")

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(queueContent))

        if (paginator.isMutlipage) {
            container.addActionRowComponents(
                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                    new NavigateLeft<typeof paginator>({ paginator, manager }).component,
                    new NavigateRight<typeof paginator>({ paginator, manager }).component,
                ),
            )
        }
    }

    return { components: [container], flags: ephemeralReplyFlags }
}



function removeQueueReply(): ReplyPayload {
    const container = new ContainerBuilder()
        .setAccentColor(Color.error)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ${Emoji.delete} removed Song`),
        )

    return { components: [container], flags: defaultReplyFlags }
}



function trackErrorReply(error: TrackError, manager: ComponentManager): ReplyPayload {
    const { track, nextTrack } = error
    const buttons = [
        new RetryPlay({ manager, data: track }).component,
        ...(nextTrack ? [new Skip("bindTrack", { manager, data: nextTrack }).component] : []),
    ]
    const container = new ContainerBuilder()
        .setAccentColor(Color.error)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ${Emoji.error} Song Error`),
        )
        .addSectionComponents(songInfo(track))
        .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons),
        )

    return { components: [container], flags: defaultReplyFlags }
}

function searchErrorReply(error: SearchError, manager: ComponentManager): ReplyPayload {
    const { query, nextTrack } = error
    const buttons = [
        new RetrySearch({ manager, data: query }).component,
        ...(nextTrack ? [new Skip("bindTrack", { manager, data: nextTrack }).component] : []),
    ]
    const container = new ContainerBuilder()
        .setAccentColor(Color.error)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### ${Emoji.error} Search Error \n\`${query}\``,
            ),
        )
        .addActionRowComponents(
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons),
        )

    return { components: [container], flags: defaultReplyFlags }
}