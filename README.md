# Timbot

**🤖 Timbot is a clever and customizable chatbot for Discord servers.**

- 👨‍💻 Easy to set up and manage from built-in **Web Admin**.
- 📢 Configurable **Live Announcements** for Twitch Streams, YouTube videos, Tweets, and more.
- 💬 Set up automatic **Responses and Reactions** to messages and other events.

## Getting started

**You'll need to run your own copy of Timbot on a server or computer.**

### Prerequisites

If you want to run a copy of Timbot (or contribute to it), you will need to make sure to install the following prerequisites first:

- Node.js runtime (download the latest LTS for your OS [here](https://nodejs.org/en/download/)).
- Yarn package manager (`npm install -g yarn`).

### Download and installation

To get started, [download the latest stable Timbot release](https://github.com/roydejong/timbot/releases) from the GitHub repository and extract it somewhere.

Open a terminal and navigate to your Timbot installation directory. Run the following command:

    yarn setup

This will perform installation of all dependencies, and build the static content for the admin panel. Once this is complete, you should be able to run Timbot.

Some configuration is needed before it'll be useful, though.

### Configuration and operation

To start Timbot, open a terminal in its installation directory, and run:

    yarn start

Configuration files are stored in the `config` directory. The the `NODE_ENV` environment variable determines what config file we attempt to load.

If you start Timbot as follows:

    export NODE_ENV=production && yarn start

This would attempt to load the `config/production.json` config file.

You can view the default configuration values under `config/default.json`, and use this as a template if you wish.

*(For details on how to set up each section, refer to "Advanced configuration" below.)*

## Using Timbot

### Inviting the Bot

Once Timbot is up and running, you want to invite it your Discord server. You can do this using a specially crafted OAuth URL:

    https://discordapp.com/oauth2/authorize?client_id=<CLIENT_ID>&scope=bot&permissions=1

You need to substitute `<CLIENT_ID>` with your Discord application's client ID (this is different from the token, and listed in your developer portal).

If your bot is marked as public, anyone can use this URL to add the bot to their server.

## Advanced configuration

The configuration file is split in to several subsections (see `config/default.json`).

### [`discord`] Discord token (bot registration)

Timbot will log in to Discord as a bot. You'll need to register that Bot as an application from the [Discord Developer Portal](https://discordapp.com/developers/applications/).

From the dev portal, click on "Create an application" and fill out the basic details. Next, visit the "Bot" tab and follow the instructions under "Build-a-Bot" to register a bot to your application. This is where you'll get your **secret token**.

|Name|Type|Default|Description|
|----|----|-------|-----------|
|`token`|`string`|(blank)|⚠️ Login token for Discord bot, from Build-a-Bot section in Developer Apps. This is a secret token.|

### [`admin`] Web admin panel

The web admin panel is where you configure Timbot. To make this possible, it runs a local web server. This server listens for HTTP requests on TCP port `4269` by default.

By default, the server binds to `0.0.0.0` which means it can accept external incoming connections if your firewall and router allow it.

|Name|Type|Default|Description|
|----|----|-------|-----------|
|`enabled`|`boolean`|`true`|If true, enable the Admin / API server.|
|`password`|`string`|`CHANGE_ME`|⚠️ The administrator password that will be required to log in to the admin panel / API. You should probably change this. If set to a blank string, login will be disabled.|
|`port`|`integer`|`4269`|TCP port number for the web server. Must be available, and must have permission.|
|`address`|`string`|`0.0.0.0`|IPv4 address to bind to. If set to `0.0.0.0` (default), binds to all network interfaces.|

### [`twitter`] Twitter integration

Twitter integration lets the bot monitor and announce new tweets from specific accounts. To enable this integration, all four configuration variables must be set.

(*Sorry, Twitter is a huge pain in the ass to set up now. I'll look into making this easier eventually so you just need to OAuth.*)

To create a Twitter app, you must first [apply for a Developer Account](https://developer.twitter.com/en/apply/user) on their developer site. This process requires manual approval from Twitter so they can verify you'll comply with their TOS. You'll receive an e-mail once your application has been reviewed.

Next, you'll need to create a new App from the [Apps section on the developer site](https://developer.twitter.com/en/apps). You'll find the keys you need in the "Keys and tokens" section of your app.

|Name|Type|Default|Description|
|----|----|-------|-----------|
|`api_key`|`string`|(blank)|Twitter: API Key (Consumer key)|
|`api_secret`|`string`|(blank)|Twitter: API Secret (Consumer key)|
|`access_token`|`string`|(blank)|Twitter: Access token key (OAuth token)|
|`access_token_secret`|`string`|(blank)|Twitter: Access token secret (OAuth secret)|
