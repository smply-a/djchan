import { internalErrorReply, invalidCommandErrorReply } from "../components/replies/error.js";
import type { ReplyPayload } from "../types/index.js";

export abstract class PublicError {
    public abstract message: string
    public abstract getReply(): ReplyPayload

    constructor() {}
}



// Internal
export class InternalError extends PublicError {
    public message = "An unexpected error occured..."

    constructor() {
        super()
    }

    public getReply(): ReplyPayload {
        return internalErrorReply(this)
    }
}



// Invalid command usage errors
export abstract class InvalidCommandError extends PublicError {
    constructor(public invalidFields: {name: string, message: string}[]) {
        super()
    }

    public getReply(): ReplyPayload {
        return invalidCommandErrorReply(this)
    }
}

export class MemberNotConnected extends InvalidCommandError {
    public message = "You must be connected to a vc."
    constructor() {
        super([])
    }     
}

export class MemberNotInSameChannel extends InvalidCommandError {
    public message: string
    constructor() {
        super([])
        this.message = `You must be connected to the same channel as the bot.`
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