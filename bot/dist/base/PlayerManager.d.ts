import { ButtonInteraction, ChatInputCommandInteraction, type Client } from "discord.js";
import { GuildPlayerInstance } from "./GuildPlayerInstance.js";
import { Logger } from "./Logger.js";
type PlayerInteraction = ChatInputCommandInteraction | ButtonInteraction;
export declare class PlayerManager {
    #private;
    private client;
    private players;
    private replyChannels;
    get logger(): Logger;
    constructor(client: Client);
    getPlayerGuarded(interaction: PlayerInteraction): Promise<GuildPlayerInstance>;
    getOrCreateGuarded(interaction: PlayerInteraction): Promise<GuildPlayerInstance>;
    private getGuardParams;
    private getOrCreate;
    private get;
    private setReplyChannel;
    private remove;
    private createPlayer;
    private sendMessage;
}
export {};
