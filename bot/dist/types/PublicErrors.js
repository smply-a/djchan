import { ContainerBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import { Color } from "../constants.js";
export class PublicError {
    constructor() { }
}
export class InvalidCommandError extends PublicError {
    invalidFields;
    constructor(invalidFields) {
        super();
        this.invalidFields = invalidFields;
    }
    getReply() {
        const container = new ContainerBuilder()
            .setAccentColor(Color.error)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${this.message}`));
        if (this.invalidFields.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder()
                .setDivider(true)
                .setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(this.invalidFields.map(field => `\`${field.name}\`: ${field.message}`).join("\n")));
        }
        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        };
    }
}
// Internal
export class InternalError extends PublicError {
    message = "An unexpected error occured...";
    constructor() {
        super();
    }
    // TODO maybe add thumbail etc
    getReply() {
        const container = new ContainerBuilder()
            .setAccentColor(Color.error)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${this.message}`));
        return {
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        };
    }
}
// Invalid command usage errors
export class MemberNotConnected extends InvalidCommandError {
    message = "You must be connected to a vc.";
    constructor() {
        super([]);
    }
}
export class MemberNotInSameChannel extends InvalidCommandError {
    message;
    constructor() {
        super([]);
        this.message = `You must be connected to the same channel as the bot.`;
    }
}
export class CLientNotConnected extends InvalidCommandError {
    message = "Bot must be connected to a vc.";
    constructor() {
        super([]);
    }
}
export class AlreadyConnected extends InvalidCommandError {
    message;
    constructor(args) {
        super([]);
        this.message = `Bot is already connected to channel: ${args.channelName ?? "UNKNOWN"}.`;
    }
}
export class VcJoinTimeOut extends InvalidCommandError {
    message = "Bot timed out trying to connect to your vc.";
    constructor() {
        super([]);
    }
}
export class AlreadyPaused extends InvalidCommandError {
    message = "Bot is already paused.";
    constructor() {
        super([]);
    }
}
export class AlreadyPlaying extends InvalidCommandError {
    message = "Bot is already playing.";
    constructor() {
        super([]);
    }
}
export class QueueEmpty extends InvalidCommandError {
    message = "The queue is empty.";
    constructor() {
        super([]);
    }
}
export class NotPlaying extends InvalidCommandError {
    message = "Bot has no track.";
    constructor() {
        super([]);
    }
}
export class OnlyInCachedGuild extends InvalidCommandError {
    message = "This can only be used in cached Guilds.";
    constructor() {
        super([]);
    }
}
