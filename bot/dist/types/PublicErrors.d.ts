import { type InteractionEditReplyOptions, type InteractionReplyOptions } from "discord.js";
import type { ReplyPayload } from "./index.js";
export declare abstract class PublicError {
    abstract message: string;
    abstract getReply(): ReplyPayload;
    constructor();
}
export declare abstract class InvalidCommandError extends PublicError {
    invalidFields: {
        name: string;
        message: string;
    }[];
    constructor(invalidFields: {
        name: string;
        message: string;
    }[]);
    getReply(): ReplyPayload;
}
export declare class InternalError extends PublicError {
    message: string;
    constructor();
    getReply(): InteractionReplyOptions & InteractionEditReplyOptions;
}
export declare class MemberNotConnected extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class MemberNotInSameChannel extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class CLientNotConnected extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class AlreadyConnected extends InvalidCommandError {
    message: string;
    constructor(args: {
        channelName: string | undefined;
    });
}
export declare class VcJoinTimeOut extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class AlreadyPaused extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class AlreadyPlaying extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class QueueEmpty extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class NotPlaying extends InvalidCommandError {
    message: string;
    constructor();
}
export declare class OnlyInCachedGuild extends InvalidCommandError {
    message: string;
    constructor();
}
