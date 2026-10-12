import { ActionRowBuilder, ContainerBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder, ThumbnailBuilder, type MessageActionRowComponentBuilder } from "discord.js";
import type { Command } from "../../base/Command.js";
import type { ComponentManager } from "../../base/Components.js";
import type { ReplyPayload } from "../../base/Paginators.js";
import { Color, Emoji, ephemeralReplyFlags, Image } from "../../constants.js";
import { HelpHome } from "../buttons/HelpHome.js";
import { CommandSelect } from "../selectMenus/commandSelect.js";

export function mainHelpreply(args: {
    manager: ComponentManager
    help: Command,
    ping: Command,
    musicCommands: Command[],
}): ReplyPayload {
    const {help, ping, musicCommands, manager} = args

    const container = new ContainerBuilder()
        .setAccentColor(Color.bot)
        .addSectionComponents(new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `### ${Emoji.info} Help\n` +
            "This bot was created to bla bla bla\n\n" +
            `${Emoji.internet} Use ${ping.getClickableString()} for latency checks`
        ))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(Image.helpMain)))
        .addSeparatorComponents(new SeparatorBuilder({spacing: SeparatorSpacingSize.Small}))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `**${Emoji.notes} Music**\n` +
            musicCommands.map(command => command.getClickableString()).join(" • ")
        ))
        .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new CommandSelect({manager, data: [ping, ...musicCommands]}).component
        ))

    return {
        components: [container],
        flags: ephemeralReplyFlags
    }
}

export function detailedHelpReply(args: {
    manager: ComponentManager
    targetCommand: Command | undefined,
    allCommands: Command[],
}): ReplyPayload {
    const {targetCommand, allCommands, manager} = args

    const container = new ContainerBuilder()

    if (!targetCommand) {
        container.setAccentColor(Color.error)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
            `### could not find command`
        ))
        .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new CommandSelect({manager, data: allCommands}).component
            ))
        .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new HelpHome({manager}).component,
        ))
    
    } else {
        container
            .setAccentColor(Color.bot)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `### ${Emoji.info} \`${targetCommand.data.name}\`\n` +
                `${targetCommand.info.description}\n\n` + 
                `> Syntax: \`${targetCommand.info.syntax}\``
            ))
            .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new CommandSelect({manager, data: allCommands}).component
            ))
             .addActionRowComponents(new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                new HelpHome({manager}).component,
            ))
    }




    return {
        components: [container],
        flags: ephemeralReplyFlags
    }
}