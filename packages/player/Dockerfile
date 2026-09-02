FROM alpine:3.24
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    curl \
    deno
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp
ENTRYPOINT [ "yt-dlp" ]