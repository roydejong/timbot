
const { MessageEmbed } = require('discord.js');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
require('dotenv').config();

module.exports = {
    name: 'language',
    aliases: ['lang'],
    description: 'editing lang',
    async execute(message, args, commandName, chalk, client, Discord) {
        const SQLite = require("better-sqlite3");
        const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
        const sql_ChannelRole = new SQLite('./Database/sqlite/config/channelRole.sqlite');
        client.getCommandAdmin = sql_Onoff.prepare("SELECT * FROM command_admin");
        client.getChannelAdmin = sql_ChannelRole.prepare("SELECT * FROM channel_admin");
        client.getRoleAdmin = sql_ChannelRole.prepare("SELECT * FROM role_admin");
        client.getLang = sql_Onoff.prepare("SELECT * FROM lang");
        for (const row_lang of client.getLang.all()) {
            let lang = require('../../../.' + row_lang.LangSet);
            for (const row_ChannelAdmin of client.getCommandAdmin.all()) {
                if(row_ChannelAdmin.Editconfig === 'true') {
                    //read config data
                    let prefix = process.env.PREFIX;
                    //code start
                    for (const row_ChannelAdmin of client.getChannelAdmin.all()) {
                    for (const row_RoleAdmin of client.getRoleAdmin.all()) {
                        const adminChannel1 = row_ChannelAdmin.Admin1;
                        const adminChannel2 = row_ChannelAdmin.Admin2;
                        const adminChannel3 = row_ChannelAdmin.Admin3;
                        const adminChannel4 = row_ChannelAdmin.Admin4;
                        const adminChannel5 = row_ChannelAdmin.Admin5;
                        const adminChannel6 = row_ChannelAdmin.Admin6;
                        const adminChannel7 = row_ChannelAdmin.Admin7;
                        const adminChannel8 = row_ChannelAdmin.Admin8;
                        const adminChannel9 = row_ChannelAdmin.Admin9;
                        const adminRole1 = row_RoleAdmin.Admin1;
                        const adminRole2 = row_RoleAdmin.Admin2;
                        const adminRole3 = row_RoleAdmin.Admin3;
                        const adminRole4 = row_RoleAdmin.Admin4;
                        const adminRole5 = row_RoleAdmin.Admin5;
                        const adminRole6 = row_RoleAdmin.Admin6;
                        const adminRole7 = row_RoleAdmin.Admin7;
                        const adminRole8 = row_RoleAdmin.Admin8;
                        const adminRole9 = row_RoleAdmin.Admin9;
                        if(message.channel.id === adminChannel1 || message.channel.id === adminChannel2 || message.channel.id === adminChannel3 
                        || message.channel.id === adminChannel4 || message.channel.id === adminChannel5 || message.channel.id === adminChannel6 
                        || message.channel.id === adminChannel7 || message.channel.id === adminChannel8 || message.channel.id === adminChannel9) {
                            if(message.member.roles.cache.has(adminRole1) || message.member.roles.cache.has(adminRole2) || message.member.roles.cache.has(adminRole3) 
                            || message.member.roles.cache.has(adminRole4) || message.member.roles.cache.has(adminRole5) || message.member.roles.cache.has(adminRole6) 
                            || message.member.roles.cache.has(adminRole7) || message.member.roles.cache.has(adminRole8) || message.member.roles.cache.has(adminRole9)) {
                                // And then we have two prepared statements to get and set the score data.
                                if(client) {
                                    if(!args[0]) {
                                        message.channel.send(lang.admin.lang.noargs1 + `\`${prefix}lang list\`` + lang.admin.lang.noargs2);
                                    }
                                    if(args[0] === 'help' || args[0] === 'list') {
                                        message.channel.send(lang.admin.lang.list);
                                    }
                                    //lang Config
                                    const sql_Onoff2 = new SQLite('./Database/sqlite/config/onoff.sqlite');
                                    if(client) {
                                        client.setLangConfig = sql_Onoff2.prepare("REPLACE INTO lang (LangID, LangSet) VALUES (@LangID, @LangSet);");
                                    };
                                    if(args[0] === 'default') {
                                        let dataLangConfigDefault;
                                        if(!dataLangConfigDefault) {
                                            dataLangConfigDefault = { LangID: row_lang.LangID, LangSet: './Database/lang/en_US.json' };
                                        }
                                        client.setLangConfig.run(dataLangConfigDefault);
                                        console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.lang.default)));
                                        message.reply(lang.admin.lang.default)
                                    }
                                    if(args[0] === '1') {
                                        let dataLangConfigEnglish;
                                        if(!dataLangConfigEnglish) {
                                            dataLangConfigEnglish = { LangID: row_lang.LangID, LangSet: './Database/lang/en_US.json' };
                                        }
                                        client.setLangConfig.run(dataLangConfigEnglish);
                                        console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.lang.en)));
                                        message.reply(lang.admin.lang.en)
                                    }
                                    if(args[0] === '2') {
                                        let dataLangConfigGerman;
                                        if(!dataLangConfigGerman) {
                                            dataLangConfigGerman = { LangID: row_lang.LangID ,LangSet: './Database/lang/de_DE.json' };
                                        }
                                        client.setLangConfig.run(dataLangConfigGerman);
                                        console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.lang.de)));
                                        message.reply(lang.admin.lang.de)
                                    }
                                };
                            } else {
                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.lang.errorperms)));
                            }
                        } else {
                            console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.lang.errorchannel)));
                        }
                    }}
                }
            }
            break;}
    }
}
