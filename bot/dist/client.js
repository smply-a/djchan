import { Client, Collection } from "discord.js";
import { Logger } from "./base/Logger.js";
import { PlayerManager } from "./base/PlayerManager.js";
export default class BotClient extends Client {
    commands;
    events;
    logger = new Logger({ type: "internal", origin: "botclient" });
    constructor(options) {
        super(options);
        // needed because of module augmentation in dicord.d.ts
        this.commands = new Collection();
        this.events = new Collection();
        this.players = new PlayerManager(this);
        // TODO button class wie gemni empfohlen
    }
    // call to start bot
    async start({ token, commands = [], events = [] }) {
        // correct load order
        this.loadEvents(events);
        await this.login(token);
        this.loadCommands(commands);
    }
    async login(token) {
        this.logger.log("logging in...");
        return super.login(token);
    }
    loadEvents(events) {
        this.logger.log("loading events...");
        events.forEach(event => {
            const evnt = new event();
            const { once, name } = evnt;
            if (once) {
                this.once(name, (...args) => evnt.run(...args));
            }
            else {
                this.on(name, (...args) => evnt.run(...args));
            }
            this.events.set(name, evnt);
        });
    }
    loadCommands(commands) {
        this.logger.log("loading commands...");
        if (!this.application) {
            throw new Error("client.application undefined");
        }
        const data = commands.map(command => {
            const cmd = new command();
            const { data } = cmd;
            this.commands.set(data.name, cmd);
            return data;
        });
        this.application.commands.set(data).then(commands => {
            commands.forEach(command => {
                const cmd = this.commands.get(command.name);
                if (!cmd) {
                    return;
                }
                cmd.id = command.id;
            });
        });
    }
}
