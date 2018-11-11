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

Open a terminal and navigate to your Timbot installation directory. Run the following command to download and install all of Timbot's dependencies and packages:

    yarn install

### Configuration and operation

To start Timbot, open a terminal in its installation directory, and run:

    yarn start

Configuration files are stored in the `config` directory. The the `NODE_ENV` environment variable determines what config file we attempt to load.

If you start Timbot as follows:

    export NODE_ENV=production && yarn start

This would attempt to load the `config/production.json` config file.

We've provided a default configuration template for your convenience under `config/default.json`.
