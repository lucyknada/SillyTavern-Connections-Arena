# SillyTavern-Connections-Arena

lmsys but local and silly(-tavern); it'll swap the connection profile each message (or every X% likelihood, see "further notes") and let you upvote/downvote with a local scoreboard for you to determine which of the models you like best. (and which you hate the most)

PRs welcome for making some kind of settings for this, otherwise just deactivate the extension if you dont want it triggering. (that's what I do too)

any other PRs are welcome too; but up for review and I do not promise to merge things. (forks remember: AGPLv3)

# usage & requirements
- tabbyAPI (no other backend supports live-loading models via `model` openAI key)
- patience (if you've got giant models loading, obviously it'll take a bit until tabby loaded it, but it'll do it on its own and generate the message)
- connection profiles (latest SillyTavern) - add "arena" to any of your connection profiles and it'll be auto-added to the selection pool next time it switches

![image](https://github.com/user-attachments/assets/ae67a125-4446-4473-8ede-60bfea65b9ab)

# commands available

`/arenamodels` - lists all the models that will be chosen from
`/arenareset` - resets local scoreboard of bad and good marked models
`/arenastats` - shows local scoreboard as system messages in chat, lists good and bad voted models separately
`/switchmodel` - force a model switch, instead of on next message
`/goodmodel` - upvote the latest response (it'll automatically detect what model generated it)
`/badmodel` - same as good, but bad model save

# further notes
if you dont like every message swapping the model and instead want an % chance just uncomment this part in the source code:

```js
// don't always change the model
// if(Math.random() < 0.8) {
//     switchModel()
// }
```
