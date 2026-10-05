# ABOUT

"djchan" is a custom music bot developed to stream youtube audio via ytdlp


### component handling (button, select menu)
- implemented via a handler that maps a uuid to the button and its data.
- needs invalidation after some time or effect -> remove from map to prevent leaks or undesired behavior
- currently need for better invalidation: not just remove it from handler, but also from message?
    - that implies a reply handler to update messages with the buttons disabled / removed
