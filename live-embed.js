const Discord = require('discord.js');

class LiveEmbed {
  static createForStream(streamData) {
    const isLive = streamData.type === "live";

    let msgEmbed = new Discord.MessageEmbed();
    msgEmbed.setColor(isLive ? "#9146ff" : "GREY");
    msgEmbed.setURL(`https://twitch.tv/${streamData.user_name.toLowerCase()}`);

    if (isLive) {
      // Add status
      msgEmbed.setTitle(`:red_circle: **${streamData.user_name} is live on Twitch!**`);

      msgEmbed.addField("Stream title", streamData.title, true);
      msgEmbed.addField("Live status", isLive ? `Live for ${streamData.viewer_count} viewers` : 'Stream has now ended', true);

      // Set thumbnail
      let thumbnailUrl = streamData.thumbnail_url;
      thumbnailUrl = thumbnailUrl.replace("{width}", "1280");
      thumbnailUrl = thumbnailUrl.replace("{height}", "720");
      let thumbnailBuster = (Date.now() / 1000).toFixed(0);
      thumbnailUrl += `?t=${thumbnailBuster}`;
      msgEmbed.setImage(thumbnailUrl);
    } else {
      msgEmbed.setTitle(`:white_circle: ${streamData.user_name} was live on Twitch.`);
      msgEmbed.setDescription('The stream has now ended.');

      msgEmbed.addField("Stream title", streamData.title, true);
    }

    return msgEmbed;
  }
}

module.exports = LiveEmbed;