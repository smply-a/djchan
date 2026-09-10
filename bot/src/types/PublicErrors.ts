import { ContainerBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, type InteractionEditReplyOptions, type InteractionReplyOptions } from "discord.js";
import { Color } from "../constants.js";
import type { ReplyPayload } from "./index.js";

export abstract class PublicError {
    public abstract message: string
    public abstract getReply(): ReplyPayload

    constructor() {}
}

export abstract class InvalidCommandError extends PublicError {
    constructor(public invalidFields: {name: string, message: string}[]) {
        super()
    }

    public getReply(): ReplyPayload {
        const container = new ContainerBuilder()
            .setAccentColor(Color.error)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${this.message}`)
            );

        if (this.invalidFields.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    this.invalidFields.map(field => `\`${field.name}\`: ${field.message}`).join("\n")
                )
            )
        }

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        }
    }
}



// Internal
export class InternalError extends PublicError {
    public message = "An unexpected error occured..."

    constructor() {
        super()
    }

    // TODO maybe add thumbail etc
    public getReply(): InteractionReplyOptions & InteractionEditReplyOptions {
        const container = new ContainerBuilder()
            .setAccentColor(Color.error)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`### ${this.message}`)
            );

        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        }
    }
}



// Invalid command usage errors
export class MemberNotConnected extends InvalidCommandError {
    public message = "You must be connected to a vc."
    constructor() {
        super([])
    }     
}

export class MemberNotInSameChannel extends InvalidCommandError {
    public message = "You must be connected to the same channel as the bot to use this command."
    constructor() {
        super([])
    }     
}

export class CLientNotConnected extends InvalidCommandError {
    public message = "Bot must be connected to a vc."
    constructor() {
        super([])
    }     
}

export class AlreadyConnected extends InvalidCommandError {
    public message
    constructor(args: {channelName: string | undefined}) {
        super([])
        this.message = `Bot is already connected to channel: ${args.channelName ?? "UNKNOWN"}.`
    }     
}

export class VcJoinTimeOut extends InvalidCommandError {
    public message = "Bot timed out trying to connect to your vc."
    constructor() {
        super([])
    }     
}

export class AlreadyPaused extends InvalidCommandError {
    public message = "Bot is already paused."
    constructor() {
        super([])
    }     
}

export class AlreadyPlaying extends InvalidCommandError {
    public message = "Bot is already playing."
    constructor() {
        super([])
    }     
}

export class QueueEmpty extends InvalidCommandError {
    public message = "The queue is empty."
    constructor() {
        super([])
    }     
}

export class NotPlaying extends InvalidCommandError {
    public message = "Bot has no track."
    constructor() {
        super([])
    }     
}

export class OnlyInCachedGuild extends InvalidCommandError {
    public message = "This can only be used in cached Guilds."
    constructor() {
        super([])
    }     
}