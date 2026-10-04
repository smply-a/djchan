import { Collection } from "discord.js";
import type { ComponentManager } from "../base/ComponentManager.ts";
import { Command, Event } from "../base/index.js";
import type { PlayerManager } from "../base/PlayerManager.ts";

declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
        events: Collection<string, Event>;
        players: PlayerManager;
        componentManager: ComponentManager
    }
}