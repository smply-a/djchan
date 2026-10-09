import type { Track } from "@app/player";
import type { AudioPlayerStatus } from "@discordjs/voice";
import type { InteractionEditReplyOptions, InteractionReplyOptions } from "discord.js";
import { ButtonInteraction } from "discord.js";
import { MusicReplies } from "../components/replies/music.js";
import type { ComponentManager } from "./Components.js";
import type { PlayerState } from "./GuildPlayerInstance.js";

export type ReplyPayload = InteractionReplyOptions & InteractionEditReplyOptions
export type Paginators = QueuePaginator

export abstract class Paginator<Data> {
    public index = 0;

    constructor(
        protected data: Data[],
        public readonly componentManager: ComponentManager
    ) {}

    // Turned into a getter so it dynamically updates when this.data changes
    public get maxIndex() {
        return Math.max(0, this.data.length - 1);
    }

    public getReply(index = 0): ReplyPayload {
        this.index = Math.max(0, Math.min(index, this.maxIndex));
        return this.render();
    }

    public get currentData() {
        const data = this.data[this.index];
        if (!data) throw new Error("Paginated reply index out of range");
        return data;
    }

    public get isMutlipage() { return this.data.length > 0; }
    public get isMostLeft() { return this.index <= 0; }
    public get isMostRight() { return this.index >= this.maxIndex; }

    protected abstract render(): ReplyPayload;
    public abstract refresh(interaction: ButtonInteraction): Promise<void> | void;
}



type QueuePaginatorData = {
    list: Track[]
    firstPage?: {
        track: Track | null,
        status: AudioPlayerStatus
    }
}

export class QueuePaginator extends Paginator<QueuePaginatorData> {
    public readonly songsPerPage: number

    constructor(playerState: PlayerState, componentManager: ComponentManager) {
        const songsPerPage = 10

        super(QueuePaginator.getQueueData(playerState, songsPerPage), componentManager);
        this.songsPerPage = songsPerPage
    }

    public async refresh(interaction: ButtonInteraction) {
        const {player} = await interaction.client.players.getPlayerGuarded(interaction);
        this.data = QueuePaginator.getQueueData(player.state, this.songsPerPage);
    }

    protected render(): ReplyPayload {
        return MusicReplies.queue(this, this.componentManager);
    }
    
    private static getQueueData({status, track, queue}: PlayerState, pagelimit: number) {

        let sliceIndex = 0

        const data: QueuePaginatorData[] = [{
            list: queue.slice(sliceIndex, pagelimit),
            firstPage: {track, status}
        }]

        for (let sliceIndex = pagelimit; sliceIndex < queue.length; sliceIndex += pagelimit) {
            data.push({
                list: queue.slice(sliceIndex, sliceIndex + pagelimit)
            })
        }

        return data
    }
}