import dotenv from 'dotenv'
import path from 'path'

export const loadEnv = () => {
    // import.meta.dirname ist hier "/Users/joeljox/smply-projects/djchan/packages/shared/utils/src"
    // ! Der code wird dort aus geführt, wo er liegt, "import" gibt nur einen "Zeiger" auf die funktion. Der Code wird nciht eingefügt.
    // Ich muss also nur wissen, wo env relativ zu dieser datei liegt
    const fullPath = path.resolve(import.meta.dirname, '../../../../', '.env')

    const result = dotenv.config({ path: fullPath })

    if (result.error && !process.env.DISCORD_TOKEN) {
        console.warn(`[Env] sysvars missing`);
    } else if (!result.error) {
        console.log(`[Env] loaded .env file`);
    } else {
        console.log(`[Env] syscvrs (Docker) used`);
    }

    return process.env;
}