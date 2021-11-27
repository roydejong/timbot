const Discord = require('discord.js');
const { Intents } = Discord;
const client = new Discord.Client({
    intents:
    [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INVITES
    ]
    , partials:
    [
        "GUILD_MEMBER"
    ]
});
const configmain = require('../../TimSys/config/config.json');
const chalk = require('chalk');
const request = require('request');
const MiniDb = require('./minidb');
const FeedParser = require('feedparser');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
    const DiscordChannelSync = require("./discord-channel-sync");

    class FooduseMonitor {
        static start() {
            if (!configmain.discord_fooduse_channel) {
                // Fooduse integration is disabled (no channel configured)
                return;
            }

            // Db init
            this.db = new MiniDb('fooduse-monitor');

            // Db read
            this.lastAnnouncedVideoGuid = null;

            try {
                const dbRecord = this.db.get("fooduse");
                if (dbRecord) {
                    this.lastAnnouncedVideoGuid = dbRecord.lastAnnouncedVideoGuid;
                }
            } catch (e) { }

            // Loop
            this.interval = setInterval(() => {
                this.doCheck();
            }, FooduseMonitor.YT_CHECK_INTERVAL_SECS * 1000);

            this.doCheck();
        }

        static doCheck() {
            let fpReq = request(this.feedUrl);
            let fp = new FeedParser();

            fpReq.on('error', (err) => {
                console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Fooduse]', chalk.white('Could not check Youtube feed (request error).', err)));
            });

            fpReq.on('response', function (res) {
                let stream = this;

                if (res.statusCode === 200) {
                    stream.pipe(fp);
                }
            });

            fp.on('error', (err) => {
                console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Fooduse]', chalk.white('Could not check Youtube feed (parser error).', err)));
            });

            let highestDate = null;
            let highestItem = null;

            fp.on('readable', function() {
                let stream = this;
                let meta = this.meta;
                let item;

                while (item = stream.read()) {
                    let itemDate = Date.parse(item.pubdate);

                    if (highestDate == null || itemDate > highestItem) {
                        highestItem = item;
                        highestDate = itemDate;
                    }
                }
            });

            fp.on('end', function() {
                if (highestItem) {
                    FooduseMonitor.handleHighestItem(highestItem);
                }
            });
        }

        static handleHighestItem(rssItem) {
            let lastGuid = this.lastAnnouncedVideoGuid;
            let thisGuid = rssItem.guid;

            if (lastGuid && lastGuid === thisGuid) {
                return;
            }

            console.debug(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][Fooduse]', chalk.white(`Found new video to announce: ${rssItem.title} [${rssItem.guid}]`)));

            this.db.put("fooduse", { lastAnnouncedVideoGuid: thisGuid });
            this.lastAnnouncedVideoGuid = thisGuid;
            this.doAnnounce(rssItem);
        }

        static doAnnounce(rssItem) {
            this.targetChannels = DiscordChannelSync.getChannelList(global.discordJsClient,
                configmain.discord_fooduse_channel, false);

            let emojiTxtBob = global.getServerEmoji("BOB_USE", true);
            let formattedMessage = `${rssItem.link} ${emojiTxtBob}`;

            for (let i = 0; i < this.targetChannels.length; i++) {
                let targetChannel = this.targetChannels[i];

                if (targetChannel) {
                    try {
                        targetChannel.send(formattedMessage);
                    } catch (err) {
                        console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Fooduse]', chalk.white('Announce error:', err)));
                    }
                }
            }
        }

        static get feedUrl() {
            let cacheBuster = Date.now();
            return `${FooduseMonitor.YT_FEED_BASE_URL}?channel_id=${FooduseMonitor.YT_CHANNEL_ID}&orderby=published&_cacheBust=${cacheBuster}`;
        }
    }

    FooduseMonitor.YT_CHANNEL_ID = "UCCuIpl5564hhP8Qpucvu7RA";
    FooduseMonitor.YT_FEED_BASE_URL = "https://www.youtube.com/feeds/videos.xml";
    FooduseMonitor.YT_CHECK_INTERVAL_SECS = 10 * 60;

    module.exports = FooduseMonitor;
