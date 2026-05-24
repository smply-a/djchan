import { Collection } from "discord.js";
import { Command, Event } from "../base/index.ts";

declare module "discord.js" {
    interface Client {
        commands: Collection<string, Command>;
        events: Collection<string, Event>;
    }
}