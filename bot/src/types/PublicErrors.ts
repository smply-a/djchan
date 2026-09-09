export type ErrorType = "general" | "player"

export abstract class PublicError {
    public abstract message: string

    constructor(public readonly type: ErrorType) {}
}



// Internal
export class InternalError extends PublicError {
    public message = "An unexpected error occured..."

    constructor() {
        super("general")
    }
}



// Player
export class MemberNotConnected extends PublicError {
    public message = "You must be connected to a vc."
    constructor() {
        super("player")
    }     
}

export class CLientNotConnected extends PublicError {
    public message = "You must be connected to a vc."
    constructor() {
        super("player")
    }     
}

export class AlreadyConnected extends PublicError {
    public message
    constructor(args: {channelName: string | undefined}) {
        super("player")
        this.message = `Bot is already connected to channel: ${args.channelName ?? "UNKNOWN"}.`
    }     
}

export class TimeOut extends PublicError {
    public message = "Bot timed out trying to connect to your channel."
    constructor() {
        super("player")
    }     
}

export class AlreadyPaused extends PublicError {
    public message = "Bot is already paused."
    constructor() {
        super("player")
    }     
}

export class AlreadyPlaying extends PublicError {
    public message = "Bot is already playing."
    constructor() {
        super("player")
    }     
}

export class QueueEmpty extends PublicError {
    public message = "The queue is empty."
    constructor() {
        super("player")
    }     
}

export class NotPlaying extends PublicError {
    public message = "Bot has no track."
    constructor() {
        super("player")
    }     
}



// General
export class OnlyInGuild extends PublicError {
    public message = "This is only allowed in Guilds."
    constructor() {
        super("player")
    }     
}