# timbot
**Discord bot that monitors a set of Twitch channels, announces them going live, and displays live stream statistics.**

![Timbot](https://user-images.githubusercontent.com/6772638/36305243-09930efe-1313-11e8-98b1-fabf0aacde88.JPG)

You can [invite it](https://discordapp.com/oauth2/authorize?client_id=411670773330345984&scope=bot) to your server for Tim's twitch channels. It announces to `#stream-announcements`.

## Installation and setup

### Prerequisites

This bot is built on Node.js. If you do not yet have Node installed, download and install the latest LTS version from the official website for your platform:

https://nodejs.org/en/download/

**It is recommended to use the LTS version of Node (v8).** Node 10 may not yet be (fully) supported.

### Install timbot

To set up timbot, download the latest [repository ZIP](https://github.com/roydejong/timbot/archive/master.zip) or clone it using `git`:

    git clone git@github.com:roydejong/timbot.git
    
Once installed, enter the directory and install the dependencies:

    cd timbot
    npm install

### Configuration
 
To configure timbot, copy the included `config-sample.json` to `config.json` and enter or customize the values in the file.

Note that you will need to create a Discord application and bot, and a new Twitch API application to use timbot.

    {
      "bot_token": "<SET_ME>",
      "twitch_client_id": "<SET_ME>",
      "twitch_check_interval_ms": 60000,
      "twitch_channels": "some,channel,names",
      "discord_announce_channel": "stream-announcements",
      "discord_mentions": {
        "channel_sample_1": "everyone",
        "channel_sample_2": "here"
      },
      "voice_enabled": false,
      "twitter_names": [],
      "twitter_api_key": "",
      "twitter_api_secret": "",
      "twitter_access_token": "",
      "twitter_access_token_secret": ""
    }

|Value|Type|Description|
|-----|----|-----------|
|`bot_token`|`string`|The Discord bot token. See [this guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) for details on setting up a Discord bot and generating a token.|
|`twitch_client_id`|`string`|Twitch Client ID for the API. [Register a new Twitch API application](https://dev.twitch.tv/dashboard/apps) to generate one. When creating the application, you can set the `URL` value to `http://localhost`.|
|`twitch_check_interval`|`integer`|The amount of milliseconds between each live status check. This also affects how often Discord messages are updated with new statistics. Timbot currently enforces a minimum interval of 60 seconds to prevent excessive requests to either service (Twitch caches data for a while anyway).|
|`twitch_channels`|`string`|A comma-separated list of channel names to monitor. Each channel in this list will be announced once it goes live after previously being offline.`|
|`discord_announce_channel`|`string`|The name of the channel the bot will announce to when a channel goes live, without the `#` token. Ensure the channel exists, and that the Bot has permissions to post messages to that channel.`|
|`discord_mentions`|`object`|Key-value object that can map channel names to the Discord mention that should be made in the announcement message (for example, `@here` or `@everyone`). Channel names must be lowercase. Mentions are only included in the initial message.`|
|`voice_enabled`|`boolean`|Enables Voice based easter egg stuff and TTS. Only works on Linux and requires `festival` to be installed. Bad for performance and will eat your disk space up quickly, probably. Don't use this in any remotely serious environment. TTS output files are stored to `/tmp` and will be re-used if available.|
|`voiced_replies`|`boolean`|If enabled, Timbot's replies in text chat will also be sent as TTS the voice channel it is on on that server.|
|`twitter_api_key`|`string`|Consumer API Token|
|`twitter_api_secret`|`string`|Consumer API Secret|
|`twitter_access_token`|`string`|User's OAuth Token|
|`twitter_access_token_secret`|`string`|User's OAuth Token Secret|
|`twitter_names`|`array`|Array of Twitter usernames to watch. Do not watch more than 15 users at a time to avoid hitting the rate limit.|
|`cleverbot_token`|`string`|API Token for Cleverbot. Used to generate general responses. Leave blank to disable functionality (bot will ignore most things).
|`discord_fooduse_channel`|`string`|Set to a Discord channel name if you want to receive Food Use / Food Dip video alerts there.|

### Starting timbot

Once the application has been configured, start it using `node` from the timbot installation directory:

    node .
  
### Inviting Timbot

Send the following link to the admin of a Discord server to let them invite the Bot:

  `https://discordapp.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot`
  
Swap `BOT_CLIENT_ID` in the URL above for your Discord app's client id, which you can find in the app details.

### Keeping it running

I recommend running Timbot as a service on a server to make sure it stays up, and gets restarted if needed.

For example, see instructions [here](https://hackernoon.com/making-node-js-service-always-alive-on-ubuntu-server-e20c9c0808e4#ae1f) for setting up a Node.js application to run as a service on Ubuntu.
