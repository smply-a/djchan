import { ChildProcess, spawn } from "child_process";
import type { Track } from "./index.js";

function validUrl(yt_url: string): boolean {
    try {
        const url = new URL(yt_url);
        const hostname = url.hostname.toLowerCase();

        if (hostname === "youtube.com" || hostname === "www.youtube.com") {
            return url.pathname === "/watch" && url.searchParams.has("v");
        }

        if (hostname === "youtu.be" || hostname === "www.youtu.be") {
            return url.pathname.length > 1;
        }

        return false;
    } catch {
        return false;
    }
}

export const ytdlp = {
    getWebmOpusStream: (url: string): ChildProcess => {
        if (!validUrl(url)) {
            throw new Error(`Invalid YouTube URL: ${url}`);
        }
        
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
    },

    getTrack: (url: string): Promise<Track> => {
        return new Promise((resolve, reject) => {
            if (!validUrl(url)) {
                return reject(new Error(`given url was not valid: ${url}`));
            }

            const ytdlp = spawn("docker", [
                "run",
                "--rm",
                "-i",
                "ytdlp-test",
                "--dump-json",
                url
            ]);

            let stdout = "";
            let stderrOutput = "";

            ytdlp.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            ytdlp.stderr.on("data", (data) => {
                stderrOutput += data.toString();
            });

            ytdlp.on("close", (code) => {
                if (code !== 0) {
                    return reject(new Error(`yt-dlp failed (code ${code}): ${stderrOutput}`));
                }

                try {
                    const trackData = JSON.parse(stdout) as Track;
                    resolve(trackData);
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