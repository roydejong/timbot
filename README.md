# Timbot
[![Discord server](https://img.shields.io/discord/411670416269115394?color=%237289da&label=discord%20server&logo=discord)](https://discord.gg/qmtXjrQ)

🤖 **A simple, customizable Discord bot that announces Twitch streams going live (plus a bunch of silly extras).**

![Timbot](https://user-images.githubusercontent.com/6772638/90008127-2ca15180-dc9c-11ea-97bc-d3a655717e42.png)

## Features

 - 📢 Monitor and announce Twitch channels going live with customizable `@mentions`.
 - 🔴 Live stream card that is automatically updated with the stream status, current game and viewership statistics.

## Using the bot

You have two options:

1. You can [invite the instance I'm running](https://discordapp.com/oauth2/authorize?client_id=411670773330345984&scope=bot) to your server for monotonetim's twitch channels (it announces to `#stream-announcements`). This bot may not always be available, and it may do silly extra things sometimes.

2. Or, run your own copy by following the instructions below, and customize it however you want.

## Installation and setup

### Prerequisites

This bot is built on Node.js. If you do not yet have Node installed, download and install the latest LTS version from the official website for your platform:

https://nodejs.org/en/download/

**Node.js, version 16.6.0 or newer, is required.**

### Installation

To set up Timbot, download the latest [repository ZIP](https://github.com/roydejong/timbot/archive/master.zip) or clone it using `git`:

    git clone git@github.com:roydejong/timbot.git
    
Once installed, enter the directory and install the dependencies:

    cd timbot
    npm install

### Getting required tokens

Note that you will need to set up some external applications: 

#### Discord bot application
Your Discord bot needs to be registered as an application, and you will need a bot token  (`TOKEN` in Timbot .env).

Follow [this guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) for more information.

#### Twitch token
👉 **I recommend using https://twitchtokengenerator.com/ to create an OAuth token for the API.**

You can also begin the authorization flow by completing the authorization prompt yourself:
 
```
https://id.twitch.tv/oauth2/authorize?client_id=<YOUR_CLIENT_ID_HERE>&response_type=token&redirect_uri=http://localhost
```

Alternatively, you can register your own application in the [Twitch Developers Console](https://dev.twitch.tv/console/apps).

Please note that your OAuth token is always tied to a specific Client ID.

### Configuration
 
To configure Timbot, customize the included `config.json` and enter.

```json
{
  "twitch_check_interval_ms": 60000,
  "twitch_use_boxart": true,
  "oauth2": {
    "twitch_client_id": "<SET_ME>",
    "twitch_client_secret": "<SET_ME>",
    "twitch_oauth_token": "<SET_ME>",
    "twitch_oauth_cooldown": "06/15/2021-06:05:15-am"
  },
  "cleverbot_token": ""
}
```
```.env
TOKEN = <SET_ME>
PREFIX = !

//-Twitch
DISCORD_ANNOUNCE_CHANNEL = <SET_ME>
TWITCH_CLIENT_ID = <SET_ME>
TWITCH_CLIENT_SECRET = <SET_ME>
TWITCH_OAUTH_TOKEN = <SET_ME>
```

Configuration options explained:

.json
|Key|Required?|Description|
|---|---------|-----------|
|`twitch_client_id`|☑|Client ID for your Twitch app, via developer portal.|
|`twitch_client_secret`|☑|Client Secret for your Twitch app, via developer portal.|
|`twitch_oauth_token`|☑|OAuth token that grants access to your Twitch app, via `id.twitch.tv` as explained above.|
|`twitch_check_interval_ms`| |How often to poll the Twitch API and send or update live embeds.|
|`twitch_use_boxart`| |If true, use alternate Live Embed style that includes game boxart as a thumbnail image if available.|

.env
|Key|Required?|Description|
|---|---------|-----------|
|`twitch_client_id`|☑|Client ID for your Twitch app, via developer portal.|
|`twitch_client_secret`|☑|Client Secret for your Twitch app, via developer portal.|
|`twitch_oauth_token`|☑|OAuth token that grants access to your Twitch app, via `id.twitch.tv` as explained above.|
|`twitch_check_interval_ms`| |How often to poll the Twitch API and send or update live embeds.|
|`twitch_use_boxart`| |If true, use alternate Live Embed style that includes game boxart as a thumbnail image if available.|

### Starting Timbot

Once the application has been configured, start it using `node` from the installation directory:

    node .
  
### Inviting Timbot

Send the following link to the admin of a Discord server to let them invite the Bot:

  `https://discordapp.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot`
  
Swap `BOT_CLIENT_ID` in the URL above for your Discord app's client id, which you can find in the app details.
