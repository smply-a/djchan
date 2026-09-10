import { ChildProcess, spawn } from "child_process";
import type { Track } from "./index.js";

function validUrl(yt_url: string): boolean {
    try {
        const url = new URL(yt_url);
        const hostname = url.hostname.toLowerCase();

        if (hostname === "youtube.com" || hostname === "www.youtube.com" || hostname === "music.youtube.com") {
            return url.pathname === "/watch" && url.searchParams.has("v");
        }

        if (hostname === "youtu.be" || hostname === "www.youtu.be") {
            return url.pathname.length > 1;
        }
        return false
    } catch {
        return false
    }
}

function isUrl(url: string) {
    try {
        new URL(url);
        return true
    } catch {
        return false
    }
}

export const ytdlp = {
    getWebmOpusStream: (url: string): ChildProcess => {
        if (isUrl(url) && validUrl(url)) {
            console.log(`starting stream... ${url}`)
            
            return spawn("docker", [
                "run",
                "--rm",
                "-i",
                "ytdlp-test",
                "--no-progress",
                "-q",
                "-x",
                "--audio-format", "opus",
                "-o", "-",
                url,
            ]);
        } else {
            throw new Error(`Invalid YouTube URL: ${url}`);
        }
    },

    getTrack: (urlOrName: string): Promise<Track> => {
        return new Promise((resolve, reject) => {

            const isurl = isUrl(urlOrName)
            if(isurl && !validUrl(urlOrName)) {
                throw new Error("link is not from youtube")
            }
            const query = isurl ? urlOrName : `ytsearch1:${urlOrName}`;

            console.log("searching...")

            const ytdlp = spawn("docker", [
                "run",
                "--rm",
                "-i",
                "ytdlp-test",
                "--no-playlist",
                "--dump-single-json",
                query
            ]);

            let stdout = "";

            ytdlp.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            ytdlp.on("close", (code) => {
                if (code !== 0) {
                    return reject(new Error(`yt-dlp failed [code: ${code}]`));
                }

                try {
                    const data = isurl ? JSON.parse(stdout) : JSON.parse(stdout).entries[0]

                    // console.log(data)

                    const {title, channel, duration, thumbnail, duration_string, uploader_url} = data;
                    const url = data.url ?? data.original_url;

                    const track: Track = {
                        url,
                        title,
                        interpret: channel,
                        duration,
                        thumbnail,
                        uploader_url
                    }
                    resolve(track);

                } catch (err) {
                    reject(new Error(`Failed to parse yt-dlp output: ${(err as Error).message}`));
                }
            });

            ytdlp.on("error", (err) => {
                reject(new Error(`Failed to start child process: ${err.message}`));
            });
        });
    }
}