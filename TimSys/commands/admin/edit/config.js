
const { MessageEmbed } = require('discord.js');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
require('dotenv').config();

module.exports = {
    name: 'config',
    aliases: ['con'],
    description: 'editing config',
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
            for (const row_CommandAdmin of client.getCommandAdmin.all()) {
                if(row_CommandAdmin.Editconfig === 'true') {
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
                                client.getReaction = sql_Onoff.prepare("SELECT * FROM reaction");
                                client.getTwitch = sql_Onoff.prepare("SELECT * FROM twitch");
                                for (const row_Reaction of client.getReaction) {
                                for (const row_Twitch of client.getTwitch) {
                                    if(client){
                                        if(client) {
                                            client.setCommandAdmin = sql_Onoff.prepare("REPLACE INTO command_admin (OnOffID, Reload, Ping, Editconfig) VALUES (@OnOffID, @Reload, @Ping, @Editconfig);");
                                            client.setReaction = sql_Onoff.prepare("REPLACE INTO reaction (OnOffID, Reaction_True, Words_True, Eliza_True, Words_Meep, Words_Haha, Words_Easteregg, Words_Gay, Words_Slap) VALUES (@OnOffID, @Reaction_True, @Words_True, @Eliza_True, @Words_Meep, @Words_Haha, @Words_Easteregg, @Words_Gay, @Words_Slap);");
                                            client.setTwitch = sql_Onoff.prepare("REPLACE INTO twitch (OnOffID, True, Setup, Request, Boxart) VALUES (@OnOffID, @True, @Setup, @Request, @Boxart);");
                                        };
                                        const configembed = new MessageEmbed()
                                        .setColor('DARK_GREEN')
                                        .setTitle('Configs - Main | OnOff | Lang')
                                        if(!args[0]) {
                                            configembed.setDescription('**' + lang.admin.config.noargs1 + `\`${prefix}config list\`` + lang.admin.config.noargs2 + '**')
                                            message.channel.send({embeds: [configembed]});
                                        };
                                        if(args[0] === 'help' || args[0] === 'command' || args[0] === 'commands' || args[0] === 'list') {
                                            configembed.setDescription(lang.admin.config.list)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                        //
                                        //Command Admin
                                        if(args[0] === 'reload') {
                                            if(args[1] === "on") {
                                                let dataConfigReloadOn;
                                                if(!dataConfigReloadOn) {
                                                    dataConfigReloadOn = { OnOffID: row_ChannelAdmin.OnOffID, Reload: 'true', Restart: row_ChannelAdmin.Restart, Shutdown: row_ChannelAdmin.Shutdown, Adminhelp: row_ChannelAdmin.Adminhelp, Changelog: row_ChannelAdmin.Changelog, Ping: row_ChannelAdmin.Ping, Editconfig: row_ChannelAdmin.Editconfig, Info: row_ChannelAdmin.Info, Db: row_ChannelAdmin.Db }
                                                };
                                                client.setCommandAdmin.run(dataConfigReloadOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reload" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataConfigReloadOff;
                                                if(!dataConfigReloadOff) {
                                                    dataConfigReloadOff = { OnOffID: row_ChannelAdmin.OnOffID, Reload: 'false', Restart: row_ChannelAdmin.Restart, Shutdown: row_ChannelAdmin.Shutdown, Adminhelp: row_ChannelAdmin.Adminhelp, Changelog: row_ChannelAdmin.Changelog, Ping: row_ChannelAdmin.Ping, Editconfig: row_ChannelAdmin.Editconfig, Info: row_ChannelAdmin.Info, Db: row_ChannelAdmin.Db }
                                                };
                                                client.setCommandAdmin.run(dataConfigReloadOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reload" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'ping') {
                                            if(args[1] === "on") {
                                                let dataConfigPingOn;
                                                if(!dataConfigPingOn) {
                                                    dataConfigPingOn = { OnOffID: row_ChannelAdmin.OnOffID, Reload: row_ChannelAdmin.Reload, Restart: row_ChannelAdmin.Restart, Shutdown: row_ChannelAdmin.Shutdown, Adminhelp: row_ChannelAdmin.Adminhelp, Changelog: row_ChannelAdmin.Changelog, Ping: 'true', Editconfig: row_ChannelAdmin.Editconfig, Info: row_ChannelAdmin.Info, Db: row_ChannelAdmin.Db }
                                                };
                                                client.setCommandAdmin.run(dataConfigPingOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("ping" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataConfigPingOff;
                                                if(!dataConfigPingOff) {
                                                    dataConfigPingOff = { OnOffID: row_ChannelAdmin.OnOffID, Reload: row_ChannelAdmin.Reload, Restart: row_ChannelAdmin.Restart, Shutdown: row_ChannelAdmin.Shutdown, Adminhelp: row_ChannelAdmin.Adminhelp, Changelog: row_ChannelAdmin.Changelog, Ping: 'false', Editconfig: row_ChannelAdmin.Editconfig, Info: row_ChannelAdmin.Info, Db: row_ChannelAdmin.Db }
                                                };
                                                client.setCommandAdmin.run(dataConfigPingOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("ping" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'config') {
                                            if(args[1] === "on") {
                                                let dataConfigConfigEditOn;
                                                if(!dataConfigConfigEditOn) {
                                                    dataConfigConfigEditOn = { OnOffID: row_ChannelAdmin.OnOffID, Reload: row_ChannelAdmin.Reload, Restart: row_ChannelAdmin.Restart, Shutdown: row_ChannelAdmin.Shutdown, Adminhelp: row_ChannelAdmin.Adminhelp, Changelog: row_ChannelAdmin.Changelog, Ping: row_ChannelAdmin.Ping, Editconfig: 'true', Info: row_ChannelAdmin.Info, Db: row_ChannelAdmin.Db }
                                                };
                                                client.setCommandAdmin.run(dataConfigConfigEditOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("config" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataConfigConfigEditOff;
                                                if(!dataConfigConfigEditOff) {
                                                    dataConfigConfigEditOff = { OnOffID: row_ChannelAdmin.OnOffID, Reload: row_ChannelAdmin.Reload, Restart: row_ChannelAdmin.Restart, Shutdown: row_ChannelAdmin.Shutdown, Adminhelp: row_ChannelAdmin.Adminhelp, Changelog: row_ChannelAdmin.Changelog, Ping: row_ChannelAdmin.Ping, Editconfig: 'false', Info: row_ChannelAdmin.Info, Db: row_ChannelAdmin.Db }
                                                };
                                                client.setCommandAdmin.run(dataConfigConfigEditOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("config" + lang.admin.config.setoff)));
                                            }
                                        };
                                        //
                                        //Reaction
                                        if(args[0] === 'reaction') {
                                            if(args[1] === "on") {
                                                let dataReactionOn;
                                                if(!dataReactionOn) {
                                                    dataReactionOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: 'true', Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataReactionOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataReactionOff;
                                                if(!dataReactionOff) {
                                                    dataReactionOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: 'false', Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataReactionOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'words') {
                                            if(args[1] === "on") {
                                                let dataReactionWordsOn;
                                                if(!dataReactionWordsOn) {
                                                    dataReactionWordsOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: 'true', Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataReactionWordsOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataReactionWordsOff;
                                                if(!dataReactionWordsOff) {
                                                    dataReactionWordsOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: 'false', Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataReactionWordsOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'eliza') {
                                            if(args[1] === "on") {
                                                let dataReactionElizaOn;
                                                if(!dataReactionElizaOn) {
                                                    dataReactionElizaOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: 'true', Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataReactionElizaOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataReactionElizaOff;
                                                if(!dataReactionElizaOff) {
                                                    dataReactionElizaOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: 'false', Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataReactionElizaOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'words_meep') {
                                            if(args[1] === "on") {
                                                let dataWordsMeepOn;
                                                if(!dataWordsMeepOn) {
                                                    dataWordsMeepOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: 'true', Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsMeepOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataWordsMeepOff;
                                                if(!dataWordsMeepOff) {
                                                    dataWordsMeepOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: 'false', Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsMeepOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'words_haha') {
                                            if(args[1] === "on") {
                                                let dataWordsHahaOn;
                                                if(!dataWordsHahaOn) {
                                                    dataWordsHahaOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: 'true', Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsHahaOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataWordsHahaOff;
                                                if(!dataWordsHahaOff) {
                                                    dataWordsHahaOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: 'false', Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsHahaOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'words_easteregg') {
                                            if(args[1] === "on") {
                                                let dataWordsEastereggOn;
                                                if(!dataWordsEastereggOn) {
                                                    dataWordsEastereggOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: 'true', Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsEastereggOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataWordsEastereggOff;
                                                if(!dataWordsEastereggOff) {
                                                    dataWordsEastereggOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: 'false', Words_Gay: row_Reaction.Words_Gay, Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsEastereggOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'words_gay') {
                                            if(args[1] === "on") {
                                                let dataWordsGayOn;
                                                if(!dataWordsGayOn) {
                                                    dataWordsGayOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: 'true', Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsGayOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataWordsGayOff;
                                                if(!dataWordsGayOff) {
                                                    dataWordsGayOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: 'false', Words_Slap: row_Reaction.Words_Slap }
                                                }
                                                client.setReaction.run(dataWordsGayOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'words_slap') {
                                            if(args[1] === "on") {
                                                let dataWordsSlapOn;
                                                if(!dataWordsSlapOn) {
                                                    dataWordsSlapOn = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: 'true' }
                                                }
                                                client.setReaction.run(dataWordsSlapOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataWordsSlapOff;
                                                if(!dataWordsSlapOff) {
                                                    dataWordsSlapOff = { OnOffID: row_Reaction.OnOffID, Reaction_True: row_Reaction.Reaction_True, Words_True: row_Reaction.Words_True, Eliza_True: row_Reaction.Eliza_True, Words_Meep: row_Reaction.Words_Meep, Words_Haha: row_Reaction.Words_Haha, Words_Easteregg: row_Reaction.Words_Easteregg, Words_Gay: row_Reaction.Words_Gay, Words_Slap: 'false' }
                                                }
                                                client.setReaction.run(dataWordsSlapOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("reaction" + lang.admin.config.setoff)));
                                            }
                                        };
                                        //
                                        //Twitch
                                        if(args[0] === 'twitch') {
                                            if(args[1] === "on") {
                                                let dataTwitchOn;
                                                if(!dataTwitchOn) {
                                                    dataTwitchOn = { OnOffID: row_Twitch.OnOffID, True: 'true', Setup: row_Twitch.Setup, Request: row_Twitch.Request, Boxart: row_Twitch.Boxart }
                                                }
                                                client.setTwitch.run(dataTwitchOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataTwitchOff;
                                                if(!dataTwitchOff) {
                                                    dataTwitchOff = { OnOffID: row_Twitch.OnOffID, True: 'false', Setup: row_Twitch.Setup, Request: row_Twitch.Request, Boxart: row_Twitch.Boxart }
                                                }
                                                client.setTwitch.run(dataTwitchOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'setup') {
                                            if(args[1] === "on") {
                                                let dataTwitchSetupOn;
                                                if(!dataTwitchSetupOn) {
                                                    dataTwitchSetupOn = { OnOffID: row_Twitch.OnOffID, True: row_Twitch.True, Setup: 'true', Request: row_Twitch.Request, Boxart: row_Twitch.Boxart }
                                                }
                                                client.setTwitch.run(dataTwitchSetupOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataTwitchSetupOff;
                                                if(!dataTwitchSetupOff) {
                                                    dataTwitchSetupOff = { OnOffID: row_Twitch.OnOffID, True: row_Twitch.True, Setup: 'false', Request: row_Twitch.Request, Boxart: row_Twitch.Boxart }
                                                }
                                                client.setTwitch.run(dataTwitchSetupOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'request') {
                                            if(args[1] === "on") {
                                                let dataTwitchReqestOn;
                                                if(!dataTwitchReqestOn) {
                                                    dataTwitchReqestOn = { OnOffID: row_Twitch.OnOffID, True: row_Twitch.True, Setup: row_Twitch.Setup, Request: 'true', Boxart: row_Twitch.Boxart }
                                                }
                                                client.setTwitch.run(dataTwitchReqestOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataTwitchReqestOff;
                                                if(!dataTwitchReqestOff) {
                                                    dataTwitchReqestOff = { OnOffID: row_Twitch.OnOffID, True: row_Twitch.True, Setup: row_Twitch.Setup, Request: 'false', Boxart: row_Twitch.Boxart }
                                                }
                                                client.setTwitch.run(dataTwitchReqestOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch" + lang.admin.config.setoff)));
                                            }
                                        };
                                        if(args[0] === 'twitch_boxart') {
                                            if(args[1] === "on") {
                                                let dataTwitchBoxartOn;
                                                if(!dataTwitchBoxartOn) {
                                                    dataTwitchBoxartOn = { OnOffID: row_ChannelAdmin.OnOffID, True: row_Twitch.True, Setup: row_Twitch.Setup, Request: row_Twitch.Request, Boxart: 'true' }
                                                };
                                                client.setTwitch.run(dataTwitchBoxartOn);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch_boxart" + lang.admin.config.seton)));
                                            }
                                            if(args[1] === "off") {
                                                let dataTwitchBoxartOff;
                                                if(!dataTwitchBoxartOff) {
                                                    dataTwitchBoxartOff = { OnOffID: row_ChannelAdmin.OnOffID, True: row_Twitch.True, Setup: row_Twitch.Setup, Request: row_Twitch.Request, Boxart: 'false' }
                                                }
                                                client.setTwitch.run(dataTwitchBoxartOff);
                                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white("twitch_boxart" + lang.admin.config.setoff)));
                                            }
                                        };
                                    };
                                }};
                            } else {
                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.config.errorperms)));
                            };
                        } else {
                            console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.config.errorchannel)));
                        };
                    }};
                };
            };
            break;};
    }
};
