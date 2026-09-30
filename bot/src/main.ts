import { loadEnv } from '@app/shared'
import { GatewayIntentBits } from "discord.js"
import MyClient from "./client.js"
import { Pause } from './commands/pause.js'
import { Ping } from "./commands/ping.js"
import { Play } from './commands/play.js'
import { Skip } from './commands/skip.js'
import { Stop } from './commands/stop.js'
import { GuildJoin, InteractionCreate, Ready } from "./events/discordjs/index.js"

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
]

async function main() {
    const env = loadEnv()
    if (env.MODE !== "dev" && env.MODE !== "prod") {
        throw new Error('run mode not set correctly in env (MODE="dev" or MODE="prod")')
    }

    const token = env.MODE === "prod" ? env.DISCORD_BOT_TOKEN : env.TEST_TOKEN

    if (!token) {
        throw new Error(`bot token not set in env (${env.MODE === "prod" ? "DISCORD_BOT_TOKEN" : "TEST_TOKEN"}="yourtoken")`)
    }
    
    const client = new MyClient({
        intents
    })

    // todo make mode change the bot token (so main and test bot dont interfer)
    await client.start({
        token,
        commands: [
            Ping,
            Play,
            Pause,
            Skip,
            Stop
        ],
        events: [
            Ready,
            InteractionCreate,
            GuildJoin
        ]
    })
}

await main()