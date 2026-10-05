import { ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import type { InternalError, InvalidCommandError } from "../../base/PublicErrors.js";
import { Color, Emoji, ephemeralReplyFlags } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";



export const ErrorReply = {
    internal: internalErrorReply,
    invalidCommand: invalidCommandErrorReply,
    expiredComponent: expiredComponentReply,
}



function baseContainer (message: string) {
    return new ContainerBuilder()
        .setAccentColor(Color.error)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ${Emoji.error} ${message}`)
        );
}



function internalErrorReply(error: InternalError): ReplyPayload {
    // TODO maybe add thumbail etc
    const container = baseContainer(error.message)

    return {
        components: [container],
        flags: ephemeralReplyFlags
    }
}

function expiredComponentReply(error: InternalError): ReplyPayload {
    const container = baseContainer(error.message)

    return {
        components: [container],
        flags: ephemeralReplyFlags
    }
}

function invalidCommandErrorReply(error: InvalidCommandError): ReplyPayload {
        const container = baseContainer(error.message)

        if (error.invalidFields.length > 0) {
            container.addSeparatorComponents(
                new SeparatorBuilder()
                    .setDivider(true)
                    .setSpacing(SeparatorSpacingSize.Small)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    error.invalidFields.map(field => `\`${field.name}\`: ${field.message}`).join("\n")
                )
            )
        }

        return {
            components: [container],
            flags: ephemeralReplyFlags
        }
    }