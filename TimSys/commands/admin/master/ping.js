
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
require('dotenv').config();

module.exports = {
    name: 'ping',
    aliases: ['pong'],
    description: 'pinging',
    guildOnly: true,
    async execute(message, args, commandName, chalk, client, Discord) {
		const SQLite = require("better-sqlite3");
		const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
		const sql_ChannelRole = new SQLite('./Database/sqlite/config/channelRole.sqlite');
		client.getRoleAdmin = sql_ChannelRole.prepare("SELECT * FROM role_admin");
		client.getLang = sql_Onoff.prepare("SELECT * FROM lang");
        for (const row_lang of client.getLang.all()) {
            let lang = require('../../../.' + row_lang.LangSet);
			//code start
			for (const row_RoleAdmin of client.getRoleAdmin.all()) {
                const adminRole1 = row_RoleAdmin.Admin1;
                const adminRole2 = row_RoleAdmin.Admin2;
                const adminRole3 = row_RoleAdmin.Admin3;
                const adminRole4 = row_RoleAdmin.Admin4;
                const adminRole5 = row_RoleAdmin.Admin5;
                const adminRole6 = row_RoleAdmin.Admin6;
                const adminRole7 = row_RoleAdmin.Admin7;
                const adminRole8 = row_RoleAdmin.Admin8;
                const adminRole9 = row_RoleAdmin.Admin9;
                if(message.member.roles.cache.has(adminRole1) || message.member.roles.cache.has(adminRole2) || message.member.roles.cache.has(adminRole3) 
                || message.member.roles.cache.has(adminRole4) || message.member.roles.cache.has(adminRole5) || message.member.roles.cache.has(adminRole6) 
                || message.member.roles.cache.has(adminRole7) || message.member.roles.cache.has(adminRole8) || message.member.roles.cache.has(adminRole9)) {
					message.channel.send(lang.admin.ping.text);
					console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.ping.log)));
				} else {
					console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.ping.errorperms)));
				};
			};
		};
	}
};
