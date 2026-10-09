// todo centralized export for all music related replies

import type { Track } from "@app/player"
import { getDurationString, viewString } from "@app/shared"
import { AudioPlayerStatus } from "@discordjs/voice"
import { ActionRowBuilder, ComponentType, ContainerBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder, type MessageActionRowComponentBuilder } from "discord.js"
import type { ComponentManager } from "../../base/Components.js"
import type { TrackError } from "../../base/GuildPlayerInstance.js"
import { QueuePaginator, type ReplyPayload } from "../../base/Paginators.js"
import { Color, defaultReplyFlags, Emoji } from "../../constants.js"
import { PlayNext, PlayNow } from "../buttons/Move.js"
import { NavigateLeft, NavigateRight } from "../buttons/Navigation.js"
import { Resume } from "../buttons/Playback.js"
import { Skip } from "../buttons/Skip.js"



export const MusicReplies = {
    nowPlaying: null,
    start: (track: Track) => playerTrackChangeReply({action: "start", track}),
    queued: (track: Track, index: number, componentManager: ComponentManager) => playerTrackChangeReply({action: "queue", track, index, manager: componentManager}),
    move: (track: Track, oldIndex: number, newIndex: number) => playerTrackChangeReply({action: "move", track, oldIndex, newIndex}),
    pause: (componentManager: ComponentManager) => playerPlaybackReply({action: "pause", manager: componentManager}),
    resume: playerPlaybackReply({action: "resume"}),
    skipped: (track: Track | null) => playerTrackChangeReply({action: "skip", track}),
    queue: renderQueuePaginator,
    stopped: playerPlaybackReply({action: "stop"}),
    request: songRequestReply,
    trackError: TrackErrorReply
}



function getBaseContainer() { 
    return new ContainerBuilder()
        .setAccentColor(Color.bot);
}

function songInfoInline(track: Track) {
    return `[${track.title}](${track.url})`
}

function songInfo(track : Track) {
    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `## [${track.title}](${track.url})\n` +
            `by ${track.interpret}` + "   •   " + `${getDurationString(track.duration)}` + "   •   " + `${viewString(track.view_count)} views` 
        ))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
}



type RequestArgs = 
    {state: "searching", query: string} | 
    {state: "result", track: Track}
export function songRequestReply(args: RequestArgs): ReplyPayload {
    const container = getBaseContainer()

    switch (args.state) {
        case "searching": {
            // todo set thumbnail with loading
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.loading} searching\n` + 
                `\`${args.query}\``
            ))
            break
        }

        // TODO add cancel button
        case "result": {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${Emoji.loading} starting song`)
            )
            container.addSectionComponents(songInfo(args.track))
            break
        }
    }

    return {
        components: [container],
        flags: defaultReplyFlags
    }
}


type TrackChangeArgs = 
    {action: "start", track: Track} | 
    {action: "skip", track: Track | null} |
    {action: "queue", track: Track, index: number, manager: ComponentManager} |
    {action: "move", track: Track, oldIndex: number, newIndex: number}
function playerTrackChangeReply(args: TrackChangeArgs): ReplyPayload {
    const container = getBaseContainer();

    const {action, track} = args
    
    switch (action) {
        case "start": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.play} now playing`
            ))
            .addSectionComponents(songInfo(track));
            break
        }
        case "skip": {
            if (track) {
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                    `### ${Emoji.skipNext} skipped to ` + songInfoInline(track)
                ))

            } else {
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                    "### queue empty"
                ))
            }
            
            break
        }

        case "queue": {
            const {manager, index} = args

            let buttons = [new PlayNow({manager, data: track}).component]
            if (index > 1) {
                buttons = [new PlayNext({manager, data: track}).component, ...buttons]
            }

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.queued} queued \`${index}\``
            ))
            .addSectionComponents(songInfo(track))
            .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons))
            break
        }

        case "move": {
            const {oldIndex, newIndex} = args

            const isPlaying = newIndex === 0;

            const emoji = isPlaying ? Emoji.play : Emoji.queued;
            const newIndexString = isPlaying ? "now playing" : newIndex;

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${emoji} position \`${oldIndex}\` ${Emoji.arrow_right} \`${newIndexString}\`\n` +
                songInfoInline(track)
            ))

            break
        }
    }

    return {
        components: [container],
        flags: defaultReplyFlags
    }
}

type PlaybackArgs = 
    {action: "pause", manager: ComponentManager} | 
    {action: "resume"} |
    {action: "stop"}
function playerPlaybackReply(args: PlaybackArgs): ReplyPayload {
    const container = getBaseContainer()

    const {action} = args
    
    switch (action) {
        case "resume": {
            container.addTextDisplayComponents({
                type: ComponentType.TextDisplay,
                content: `### ${Emoji.play} resumed`
            })
            break
        }

        case "pause": {
            const {manager} = args

            container.addSectionComponents({
                type: ComponentType.Section,
                components: [{
                    type: ComponentType.TextDisplay,
                    content: `### ${Emoji.pause} paused`
                }],
                accessory: new Resume({manager}).component.toJSON() 
            })
            break
        }

        case "stop": {
            container.addTextDisplayComponents({
                type: ComponentType.TextDisplay,
                content: `### ${Emoji.stop} stopped`
            })
            break
        }
    }

    return {
        components: [container],
        flags: defaultReplyFlags
    }
}

function renderQueuePaginator(paginator: QueuePaginator, manager: ComponentManager): ReplyPayload {
    const container = getBaseContainer()
    const {firstPage, list} = paginator.currentData

    // title first page
    if (firstPage) {
        const {status, track} = firstPage
        const state = 
            status === AudioPlayerStatus.Buffering ? "buffering" :
            status === AudioPlayerStatus.Playing ? "playing" :
            status === AudioPlayerStatus.Idle ? "player is idle" :
            "paused"
        
        container
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.queued} queue\n` +
                `\`${state}\` ${track ? `[${track.title}](${track.url})`: ""}\n`
            ))
            .addSeparatorComponents(new SeparatorBuilder().setDivider().setSpacing(SeparatorSpacingSize.Small))
    
    // set title on later pages
    } else {
        container
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `### ${Emoji.queued} queue\n`
        ))
    }

    // skip for loop if there is nothing in queue
    if (list.length === 0) {
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
            "queue empty"
        ))

    // list queue
    } else {
        const indexOffset = paginator.songsPerPage * paginator.index

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
            list.map((track, index) => `${index+1 + indexOffset}. [${track.title}](${track.url})`).join("\n")
        ))
        
        if (paginator.isMutlipage) {
            container.addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>()
                .addComponents(
                    new NavigateLeft<typeof paginator>({paginator, manager}).component,
                    new NavigateRight<typeof paginator>({paginator, manager}).component
                )
            )
        }
    }

    return {
        components: [container],
        flags: defaultReplyFlags
    }
}

function TrackErrorReply(error: TrackError, componentManager: ComponentManager): ReplyPayload {
    const {track, nextTrack} = error

    const container = new ContainerBuilder()
        .setAccentColor(Color.error)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `### ${Emoji.error} error while playing song`
        ))
        .addSectionComponents(songInfo(track))
    
    if (nextTrack) {
        container.addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(new Skip("bindTrack", {manager: componentManager, data: {track, nextTrack}}).component)
        )
    }

    return {
        components: [container],
        flags: defaultReplyFlags
    }
}