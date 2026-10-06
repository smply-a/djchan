// todo centralized export for all music related replies

import type { Track } from "@app/player"
import { getDurationString, viewString } from "@app/shared"
import { ActionRowBuilder, ComponentType, ContainerBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, ThumbnailBuilder, type MessageActionRowComponentBuilder } from "discord.js"
import type { ComponentManager } from "../../base/ComponentManager.js"
import { Color, defaultReplyFlags, Emoji } from "../../constants.js"
import type { ReplyPayload } from "../../types/index.js"
import { PlayNext } from "../buttons/PlayNext.js"
import { PlayNow } from "../buttons/PlayNow.js"
import { Resume } from "../buttons/Resume.js"



export const MusicReplies = {
    nowPlaying: null,
    start: (track: Track) => playerTrackChangeReply({action: "start", track}),
    queue: (track: Track, index: number, manager: ComponentManager, guildId: string) => playerTrackChangeReply({action: "queue", manager, track, index, guildId}),
    move: (track: Track, oldIndex: number, newIndex: number) => playerTrackChangeReply({action: "move", track, oldIndex, newIndex}),
    pause: (manager: ComponentManager, guildId: string) => playerPlaybackReply({action: "pause", manager, guildId}),
    resume: playerPlaybackReply({action: "resume"}),
    empty: queueEmpty(),
    skipped: (track: Track) => playerTrackChangeReply({action: "skip", track}),
    stopped: playerPlaybackReply({action: "stop"}),
    request: songRequestReply,
}



function getBaseContainer() { 
    return new ContainerBuilder()
        .setAccentColor(Color.bot);
}

function songInfoInline(track: Track) {
    return `[${track.title}](${track.url})`
}

function songInfo({track} : {track: Track}) {
    return new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `${`## [${track.title}](${track.url})`}\n` +
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
                `### ${Emoji.loading} searching ` + `\`${args.query}\``
            ))
            break
        }

        // TODO add cancel button
        case "result": {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("### result")
            )
            container.addSectionComponents(songInfo({track: args.track}))
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
    {action: "skip", track: Track} |
    {action: "queue", track: Track, index: number, manager: ComponentManager, guildId: string} |
    {action: "move", track: Track, oldIndex: number, newIndex: number}
function playerTrackChangeReply(args: TrackChangeArgs): ReplyPayload {
    const container = getBaseContainer();

    const {action, track} = args
    
    switch (action) {
        case "start": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.play} now playing`
            ))
            .addSectionComponents(songInfo({track}));
            break
        }
        case "skip": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.skipNext} skipped to ` + songInfoInline(track)
            ))
            break
        }

        case "queue": {
            const {manager, index, guildId} = args
            const context = {track}

            let buttons = [new PlayNow({manager, context, guildId}).component]
            if (index > 1) {
                buttons = [new PlayNext({manager, context, guildId}).component, ...buttons]
            }

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.queued} postion \`${index}\``
            ))
            .addSectionComponents(songInfo({track}))
            .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(buttons))
            break
        }

        // todo make old index -> new index
        case "move": {
            const {oldIndex, newIndex} = args

            const isNext = newIndex === 1;
            const isPlaying = newIndex === 0;

            const emoji = isPlaying ? Emoji.play : isNext ? Emoji.queued_next : Emoji.queued;
            const newIndexString = isPlaying ? "now playing" : isNext ? "next" : newIndex;

            container.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${emoji} position \`${oldIndex}\` ${Emoji.arrow_right} ${newIndexString} \n` +
                songInfoInline(track)
            ))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(track.thumbnail))
        )

            break
        }
    }

    return {
        components: [container],
        flags: defaultReplyFlags
    }
}

type PlaybackArgs = 
    {action: "pause", manager: ComponentManager, guildId: string} | 
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
            const {manager, guildId} = args

            container.addSectionComponents({
                type: ComponentType.Section,
                components: [{
                    type: ComponentType.TextDisplay,
                    content: `### ${Emoji.pause} paused`
                }],
                accessory: new Resume({manager, guildId}).component.toJSON() 
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
        flags: MessageFlags.IsComponentsV2
    }
}



function queueEmpty(): ReplyPayload {
    const container = getBaseContainer()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("### queue empty"))

    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    }
}