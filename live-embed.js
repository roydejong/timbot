const Discord = require('discord.js');
const moment = require('moment');
const humanizeDuration = require("humanize-duration");

class LiveEmbed {
  static createForStream(streamData) {
    const isLive = streamData.type === "live";

    let msgEmbed = new Discord.MessageEmbed();
    msgEmbed.setColor(isLive ? "#9146ff" : "GREY");
    msgEmbed.setURL(`https://twitch.tv/${streamData.user_name.toLowerCase()}`);
    msgEmbed.setThumbnail(streamData.profile_image_url);

    if (isLive) {
      msgEmbed.setTitle(`:red_circle: **${streamData.user_name} is live on Twitch!**`);
      msgEmbed.addField("Title", streamData.title, false);

      // Add game
      if (streamData.game) {
        msgEmbed.addField("Game", streamData.game.name, false);
      }

      // Add status
      msgEmbed.addField("Status", isLive ? `Live with ${streamData.viewer_count} viewers` : 'Stream has ended', true);

      // Set thumbnail
      let thumbnailUrl = streamData.thumbnail_url;
      thumbnailUrl = thumbnailUrl.replace("{width}", "1280");
      thumbnailUrl = thumbnailUrl.replace("{height}", "720");
      let thumbnailBuster = (Date.now() / 1000).toFixed(0);
      thumbnailUrl += `?t=${thumbnailBuster}`;
      msgEmbed.setImage(thumbnailUrl);

      // Add uptime
      let now = moment();
      let startedAt = moment(streamData.started_at);

      msgEmbed.addField("Uptime", humanizeDuration(now - startedAt, {
        delimiter: ", ",
        largest: 2,
        round: true,
        units: ["y", "mo", "w", "d", "h", "m"]
      }), true);
    } else {
      msgEmbed.setTitle(`:white_circle: ${streamData.user_name} was live on Twitch.`);
      msgEmbed.setDescription('The stream has now ended.');

      msgEmbed.addField("Title", streamData.title, true);
    }

    return msgEmbed;
  }
}

module.exports = LiveEmbed;