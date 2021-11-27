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
const chalk = require('chalk');
const fs = require('fs');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';

  class MiniDb {
    constructor(name) {
      this.basePath = `${__dirname}/data/${name}`;

      if (!fs.existsSync(this.basePath)){
        console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + '][MiniDb]', chalk.white('Create base directory:', this.basePath)));
        fs.mkdirSync(this.basePath);
      }
    }

    get(id) {
      const filePath = `${this.basePath}/${id}.json`;

      try {
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, {
            encoding: 'utf8',
            flag: 'r'
          });
          return JSON.parse(raw) || null;
        }
      } catch (e) {
        console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][MiniDb]', chalk.white('Write error:', filePath, e)));
      }
      return null;
    }

    put(id, value) {
      const filePath = `${this.basePath}/${id}.json`;

      try {
        const raw = JSON.stringify(value);
        fs.writeFileSync(filePath, raw, {
          encoding: 'utf8',
          mode: '666',
          flag: 'w'
        });
        return true;
      } catch (e) {
        console.error(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][MiniDb]', chalk.white('Write error:', filePath, e)));
        return false;
      }
    }
  }

  module.exports = MiniDb;
