import { Client, Collection, type ClientOptions } from "discord.js";
import type { Command } from "./base/Command.js";
import type { Event } from "./base/Event.js";
import { Logger } from "./base/Logger.js";

export default class BotClient extends Client {
    public commands: Collection<string, Command>
    public events: Collection<string, Event>
    public logger = new Logger({type: "internal", origin: "botclient"})

    constructor(options: ClientOptions) {
        super(options)
        // needed because of module augmentation in dicord.d.ts
        this.commands = new Collection()
        this.events = new Collection()
        // TODO button class wie gemni empfohlen
    }

    // call to start bot
    public async start({token, commands = [], events = []} : {
        token: string
        commands?: (new () => Command)[],
        events?: (new () => Event)[] 
    }) {
        // correct load order
        this.loadEvents(events)
        await this.login(token)
        this.loadCommands(commands)
    }

    public async login(token: string) {
        this.logger.log("logging in...")
        return super.login(token)
    }

    private loadEvents(events: (new () => Event)[]) {
        this.logger.log("loading events...")

        events.forEach(event => {
            const evnt = new event()
            const {once, name} = evnt
            if (once) {
                this.once(name, (...args) => evnt.execute(...args))
            } else {
                this.on(name, (...args) => evnt.execute(...args))
            }
            this.events.set(name, evnt)
        })
    }

    private loadCommands(commands: (new () => Command)[]) {
        this.logger.log("loading commands...")

        if (!this.application) {
            throw new Error("client.application undefined")
        }

        const data = commands.map(command => {
            const cmd = new command()
            const {data} = cmd
            this.commands.set(data.name, cmd)
            return data
        })

        this.application.commands.set(data).then(commands => {
            commands.forEach(command => {
                const cmd = this.commands.get(command.name)
                if (!cmd) {
                    return
                }
                cmd.id = command.id
            })
        })
    }
}