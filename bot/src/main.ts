import { loadEnv } from '@app/shared'
import { GatewayIntentBits } from "discord.js"
import MyClient from "./client.js"
import { Ping } from "./commands/ping.js"
import { InteractionCreate, Ready } from "./events/discordjs/index.js"

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
]

async function main() {
    const env = loadEnv()
    if (!env.DISCORD_BOT_TOKEN) {
        throw new Error("bot token not set in env")
    }
    
    const client = new MyClient({
        intents,
    })

    await client.start({
        token: env.DISCORD_BOT_TOKEN,
        commands: [
            Ping
        ],
        events: [
            Ready,
            InteractionCreate
        ]
    })
}

await main()