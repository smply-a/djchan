import dotenv from 'dotenv'
import path from 'path'

export const envPath = (relativePath: string) => {
    const fullPath = path.resolve(process.cwd(), relativePath)
    
    const result = dotenv.config({ path: fullPath })
    
    if (result.error || !result.parsed) {
        throw new Error(`No .env file found at: ${fullPath}`)
    }
    
    return result.parsed
}