# timbot
**Discord bot that monitors a set of Twitch channels, announces them going live, and displays live stream statistics.**

![Timbot](https://user-images.githubusercontent.com/6772638/36305243-09930efe-1313-11e8-98b1-fabf0aacde88.JPG)

You can [invite it](https://discordapp.com/oauth2/authorize?client_id=411670773330345984&scope=bot) to your server for Tim's twitch channels. It announces to `#stream-announcements`.

## Installation and setup

### Prerequisites

This bot is built on Node.js. If you do not yet have Node installed, download and install the latest LTS version from the official website for your platform:

https://nodejs.org/en/download/

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
        "twitch_check_interval_ms": 2500,
        "twitch_channels": "some,channel,names",
        "discord_announce_channel": "stream-announcements",
        "discord_mentions": {
            "some": "everyone",
            "channel": "here"
        }
    }

|Value|Type|Description|
|-----|----|-----------|
|`bot_token`|`string`|The Discord bot token. See [this guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) for details on setting up a Discord bot and generating a token.|
|`twitch_client_id`|`string`|Twitch Client ID for the API. [Register a new Twitch API application](https://dev.twitch.tv/dashboard/apps) to generate one. When creating the application, you can set the `URL` value to `http://localhost`.|
|`twitch_check_interval`|`integer`|The amount of milliseconds between each live status check. Note that Twitch API is rate limited to one request per second. Timbot currently enforces a minimum interval of 2500ms.|
|`twitch_channels`|`string`|A comma-separated list of channel names to monitor. Each channel in this list will be announced once it goes live after previously being offline.`|
|`discord_announce_channel`|`string`|The name of the channel the bot will announce to when a channel goes live, without the `#` token. Ensure the channel exists, and that the Bot has permissions to post messages to that channel.`|
|`discord_mentions`|`object`|Key-value object that can map channel names to the Discord mention that should be made in the announcement message (for example, `@here` or `@everyone`). Channel names must be lowercase. Mentions are only included in the initial message.`| 

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
