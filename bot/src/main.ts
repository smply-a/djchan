import { loadEnv } from '@app/shared'
import { ActivityType, GatewayIntentBits } from "discord.js"
import MyClient from "./client.js"
import { Pause } from './commands/pause.js'
import { Ping } from "./commands/ping.js"
import { Play } from './commands/play.js'
import { Queue } from './commands/queue.js'
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
    const mode = env.MODE
    if (mode !== "dev" && mode !== "prod") {
        throw new Error('run mode not set correctly in env (MODE="dev" or MODE="prod")')
    }

    const token = mode === "prod" ? env.DISCORD_BOT_TOKEN : env.TEST_TOKEN

    if (!token) {
        throw new Error(`bot token not set in env (${mode === "prod" ? "DISCORD_BOT_TOKEN" : "TEST_TOKEN"}="yourtoken")`)
    }
    
    const client = new MyClient({
        intents,
        presence: {
            status: "online",
            activities: [{
                name: "streaming yt music", 
                type: ActivityType.Custom
            }]
        }
    })

    await client.start({
        token,
        commands: [
            Ping,
            Play,
            Pause,
            Skip,
            Stop, 
            Queue
        ],
        events: [
            Ready,
            InteractionCreate,
            GuildJoin
        ]
    })

    // handle shutdown
    process.on('SIGTERM', () => {
        client.logger.log('Shutting down...');
        
        client.destroy(); 
        process.exit(0); 
    });

    // handle strg c
    process.on('SIGINT', () => {
        client.logger.log('Shutting down...');
        client.destroy();
        process.exit(0);
    });
}

await main()