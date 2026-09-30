import { ContainerBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from "discord.js";
import type { InternalError, InvalidCommandError } from "../../base/PublicErrors.js";
import { Color, Emoji } from "../../constants.js";
import type { ReplyPayload } from "../../types/index.js";

const baseContainer = (message: string) => new ContainerBuilder()
        .setAccentColor(Color.error)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### ${Emoji.error} ${message}`)
        );

const flags = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral 

export function internalErrorReply(error: InternalError): ReplyPayload {
    // TODO maybe add thumbail etc
    const container = baseContainer(error.message)

    return {
        components: [container],
        flags
    }
}

export function invalidCommandErrorReply(error: InvalidCommandError): ReplyPayload {
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
            flags
        }
    }