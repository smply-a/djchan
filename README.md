# ABOUT
"djchan" is a custom music bot developed to stream youtube audio via ytdlp. It tries to use as few dependencies as possible and give the user an intuitive experience with just the right amount of control.

I started this by myself, but am *open to new maintainers*, so feel free to join and message me :3


# OPEN WORK
### component handling (button, select menu)
- needs invalidation after some time or effect -> remove from map to prevent leaks or undesired behavior
- currently need for better invalidation: not just remove it from handler, but also from message?
    - that implies a reply handler to update messages with the buttons disabled / removed
