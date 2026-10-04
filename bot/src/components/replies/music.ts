// todo centralized export for all music related replies

import type { Track } from "@app/player"
import { ActionRowBuilder, ContainerBuilder, MessageFlags, TextDisplayBuilder, type MessageActionRowComponentBuilder } from "discord.js"
import type { ComponentManager } from "../../base/ComponentManager.js"
import { Color, defaultReplyFlags } from "../../constants.js"
import type { ReplyPayload } from "../../types/index.js"
import { Resume } from "../buttons/Resume.js"
import { songInfo } from "../sections/songInfo.js"



export const MusicReplies = {
    nowPlaying: null,
    start: (track: Track) => playerTrackChangeReply({action: "start", track}),
    queue: (track: Track) => playerTrackChangeReply({action: "queue", track}),
    pause: (manager: ComponentManager) => playerPlaybackReply({action: "pause", manager, }),
    resume: playerPlaybackReply({action: "resume"}),
    empty: queueEmpty(),
    skipped: (track: Track) => playerTrackChangeReply({action: "skip", track}),
    stopped: playerPlaybackReply({action: "stop"}),
    request: songRequestReply,
}



function getBaseContainer() { return new ContainerBuilder()
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
    {action: "queue", track: Track}
function playerTrackChangeReply(args: TrackChangeArgs
): ReplyPayload {
    const container = getBaseContainer();

    const {action, track} = args
    
    switch (action) {
        case "start": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                "### now playing"
            ))
            break
        }
        case "skip": {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                "### skipped to"
            ))
            break
        }
        // TODO add queue move buttons, PLAY NOW button
        case "queue": {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("### queued")
            )
            break
        }
    }

    container.addSectionComponents(songInfo({track}));

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
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent("### resumed"))
            break
        }
        case "pause": {
            container
                .addTextDisplayComponents(new TextDisplayBuilder().setContent("### paused"))
                .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(new Resume({manager: args.manager}).builder)
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