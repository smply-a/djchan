// todo centralized export for all music related replies

import type { Track } from "@app/player"
import { ActionRowBuilder, ContainerBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, type MessageActionRowComponentBuilder } from "discord.js"
import type { ComponentManager } from "../../base/ComponentManager.js"
import { Color, defaultReplyFlags, Emoji } from "../../constants.js"
import type { ReplyPayload } from "../../types/index.js"
import { PlayNext } from "../buttons/PlayNext.js"
import { PlayNow } from "../buttons/PlayNow.js"
import { Resume } from "../buttons/Resume.js"
import { songInfo } from "../sections/songInfo.js"



export const MusicReplies = {
    nowPlaying: null,
    start: (track: Track) => playerTrackChangeReply({action: "start", track}),
    queue: (track: Track, index: number, manager: ComponentManager) => playerTrackChangeReply({action: "queue", manager, track, index}),
    move: (track: Track, index: number) => playerTrackChangeReply({action: "move", track, index}),
    pause: (manager: ComponentManager) => playerPlaybackReply({action: "pause", manager, }),
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



type RequestArgs = 
    {state: "searching", query: string} | 
    {state: "result", track: Track}
export function songRequestReply(args: RequestArgs): ReplyPayload {
    const container = getBaseContainer()

    switch (args.state) {
        case "searching": {
            // todo set thumbnail with loading
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                "### searching\n" + 
                `\`${args.query}\``
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
    {action: "queue", track: Track, index: number, manager: ComponentManager} |
    {action: "move", track: Track, index: number}
function playerTrackChangeReply(args: TrackChangeArgs
): ReplyPayload {
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
                `### ${Emoji.skipNext} skipped to`
            ))
            .addSectionComponents(songInfo({track}));
            break
        }

        case "queue": {
            const {manager, index} = args
            const context = {track, index}

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.queued} queued at postion ${index}`
            ))
            .addSectionComponents(songInfo({track}))
            .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new PlayNow({manager, context}).component,
                new PlayNext({manager, context}).component
            ))
            break
        }

        case "move": {
            const {index} = args

            const title = index > 0 ?
                index > 1 ? `moved to position ${index}` : "playing next" 
            : "moved to front"

            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${title}`
            ))
            .addSectionComponents(songInfo({track}))
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
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.play} resumed`
            ))
            break
        }
        case "pause": {
            const {manager} = args

            container.addSectionComponents(new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                    `### ${Emoji.pause} paused`
                ))
                .setButtonAccessory(new Resume({manager}).component)
            )
            break
        }
        case "stop": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### stopped"))
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