# Timbot

**🤖 Timbot is clever robot for Discord servers.**

- Fully configurable with a web interface.
- Beautiful automatic live announcements for Twitch streams, Twitter posts, YouTube video's, and more.


https://roydejong.net/timbot

## Getting started

### Prerequisites

If you want to run a copy of Timbot or develop it, you will need to make sure to install the following prerequisites first:

- Node.js runtime (download for your OS [here](https://nodejs.org/en/download/))
- Yarn package manager (`npm install -g yarn`)

### Download and installation

To get started, [download the latest stable Timbot release](https://github.com/roydejong/timbot/releases) from the GitHub repository and extract it somewhere.

Open a terminal and navigate to your Timbot installation directory. Run the following command:

    yarn setup

This will perform installation of all dependencies, and build the static content for the admin panel.

### Configuration and operation

To start Timbot, open a terminal in its installation directory, and run:

    yarn start

Configuration files are stored in the `config` directory. The the `NODE_ENV` environment variable determines what config file we attempt to load.

If you start Timbot as follows:

    export NODE_ENV=production && yarn start

This would attempt to load the `config/production.json` config file.

We've provided a default configuration template for your convenience under `config/default.json`.

For details on how to set up each section, refer to "Advanced configuration" below.

## Advanced configuration

### Registering your Discord bot

Timbot will log in to Discord as a bot. You'll need to register that Bot as an application from the [Discord Developer Portal](https://discordapp.com/developers/applications/).

From the dev portal, click on "Create an application" and fill out the basic details. Next, visit the "Bot" tab and follow the instructions under "Build-a-Bot" to register a bot to your application.

You'll need to copy your **token** and set it in your Timbot config file under **`discord.token`** (remember: keep this token a secret!).

