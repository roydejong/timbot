const Discord = require('discord.js');
const { Intents, MessageEmbed } = Discord;
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
const { DateTime } = require('luxon');
const configmain = require('../../TimSys/config/config.json');
const humanizeDuration = require("humanize-duration");
const SQLite = require("better-sqlite3");

const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
client.getLang = sql_Onoff.prepare("SELECT * FROM lang");
  class LiveEmbed {
    static createForStream(streamData) {
      for (const row_lang of client.getLang.all()) {
        let lang = require('../.' + row_lang.LangSet);
        const isLive = streamData.type === "live";
        const allowBoxArt = configmain.twitch_use_boxart;

        const msgEmbed = new MessageEmbed()
        msgEmbed.setColor(isLive ? "#9146ff" : "GREY");
        msgEmbed.setURL(`https://twitch.tv/${(streamData.login || streamData.user_name).toLowerCase()}`);

        // Thumbnail
        let thumbUrl = streamData.profile_image_url;

        if (allowBoxArt && streamData.game && streamData.game.box_art_url) {
          thumbUrl = streamData.game.box_art_url;
          thumbUrl = thumbUrl.replace("{width}", "288");
          thumbUrl = thumbUrl.replace("{height}", "384");
        }

        msgEmbed.setThumbnail(thumbUrl);

        if (isLive) {
          // Title
          msgEmbed.setTitle(`:red_circle: **${streamData.user_name} ${lang.twitch.islivetitle}**`);
          msgEmbed.addField(lang.twitch.title, streamData.title, false);
        } else {
          msgEmbed.setTitle(`:white_circle:`, streamData.user_name, lang.twitch.waslivetitle);
          msgEmbed.setDescription(lang.twitch.waslivedesc);

          msgEmbed.addField(lang.twitch.title, streamData.title, true);
        }

        // Add game
        if (streamData.game) {
          msgEmbed.addField(lang.twitch.game, streamData.game.name, false);
        }

        if (isLive) {
          // Add status
          msgEmbed.addField(lang.twitch.status, isLive ? `${lang.twitch.livewith} ${streamData.viewer_count} ${lang.twitch.viewers}` : `${lang.twitch.ended}`, true);

          // Set main image (stream preview)
          let imageUrl = streamData.thumbnail_url;
          imageUrl = imageUrl.replace("{width}", "1280");
          imageUrl = imageUrl.replace("{height}", "720");
          let thumbnailBuster = (Date.now() / 1000).toFixed(0);
          imageUrl += `?t=${thumbnailBuster}`;
          msgEmbed.setImage(imageUrl);

          // Add uptime
          let now = DateTime.now();
          let startedAtISO = DateTime.fromISO(streamData.started_at);
          let startedAt = startedAtISO.toMillis()

          msgEmbed.addField(lang.twitch.uptime, humanizeDuration(now - startedAt, {
            delimiter: ", ",
            largest: 2,
            round: true,
            units: ["y", "mo", "w", "d", "h", "m"]
          }), true);
        }

        return msgEmbed;
      }
    }
  }

  module.exports = LiveEmbed;
