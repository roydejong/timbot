
const { MessageEmbed } = require('discord.js');
const { DateTime } = require('luxon');
const { arg } = require('mathjs');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
require('dotenv').config();

module.exports = {
    name: 'twitchconfig',
    aliases: ['twitch'],
    description: 'editing stuff',
    async execute(message, args, commandName, chalk, client, Discord) {
        const SQLite = require("better-sqlite3");
        const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
        const sql_ChannelRole = new SQLite('./Database/sqlite/config/channelRole.sqlite');
        const sql_Twitch = new SQLite('./Database/sqlite/twitch.sqlite');
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
                    for (const row_ChannelUser of client.getChannelAdmin.all()) {
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
                                if(client) {
                                    const configembed = new MessageEmbed()
                                    .setColor('DARK_GREEN')
                                    .setTitle('Twitch config')
                                    if(!args[0]) {
                                        configembed.setDescription('**' + lang.admin.config.noargs1 + `\`${prefix}config list\`` + lang.admin.config.noargs2 + '**')
                                        message.channel.send({embeds: [configembed]});
                                    };
                                    if(args[0] === 'help' || args[0] === 'command' || args[0] === 'commands' || args[0] === 'list') {
                                        configembed.setDescription(lang.admin.config.list)
                                        message.channel.send({embeds: [configembed]});
                                    };
                                    const sql_ChannelRole2 = new SQLite('./Database/sqlite/config/channelRole.sqlite');
                                    if(client) {
                                        client.getTwitchChannel = sql_Twitch.prepare("SELECT * FROM twitchchannel WHERE TwitchChannelID = ?");
                                        client.setChannelUser = sql_ChannelRole2.prepare("REPLACE INTO channel_user (ChannelRoleID, Announce1) VALUES (@ChannelRoleID, @Announce1);");
                                        client.setTwitchChannel = sql_Twitch.prepare("INSERT OR REPLACE INTO twitchchannel (TwitchChannelID, ChannelList, Mention) VALUES (@TwitchChannelID, @ChannelList, @Mention);");
                                        client.setTwitchChannel2 = sql_Twitch.prepare("INSERT OR REPLACE INTO twitchchannel (TwitchChannelID, ChannelList, Mention) VALUES (@TwitchChannelID, @ChannelList, @Mention);");
                                        client.delTwitchChannel = sql_Twitch.prepare("DELETE FROM twitchchannel WHERE ChannelList = ?");
                                    };
                                    //
                                    // Admin
                                    let argsNumber;
                                    if(args[1]) {
                                        if(typeof args[1] != "number") {
                                            let argsRemove1 = args[1].replace('<#', '')
                                            argsNumber = argsRemove1.replace('>', '')
                                        };
                                    }
                                    let argsNumber2;
                                    if(args[2]) {
                                        if(typeof args[2] != "number") {
                                            let argsRemove2 = args[2].replace('<@&', '')
                                            argsNumber2 = argsRemove2.replace('>', '')
                                            if(args[2] === '@everyone') {
                                                let argsRemove3 = args[2].replace('@', '')
                                                argsNumber2 = argsRemove3
                                            }
                                        };
                                    }
                                    if(args[0] === 'announce') {
                                        if(typeof argsNumber != "number" ) {
                                            // console.log(message)
                                            let guildId = message.guild.id;
                                            let channelId = argsNumber;
                                            let guild = client.guilds.cache.get(guildId);
                                            let channelInfo = guild.channels.cache.get(channelId);
                                            let dataTwitchAnnounce;
                                            dataTwitchAnnounce = { ChannelRoleID: row_ChannelUser.ChannelRoleID, Announce1: `${channelInfo.name}` }
                                            client.setChannelUser.run(dataTwitchAnnounce)
                                            configembed.setDescription(`**Set Announcement Channel to <#${argsNumber}>**`)
                                            message.channel.send({embeds: [configembed]});
                                        }
                                    };
                                    if(args[0] === 'channellist') {
                                        dataChannelList1 = client.getTwitchChannel.get("1")
                                        dataChannelList2 = client.getTwitchChannel.get("2")
                                        configembed.setDescription(`\`\`\`${dataChannelList1.TwitchChannelID} | ${dataChannelList1.ChannelList} | ${dataChannelList1.Mention}\n${dataChannelList2.TwitchChannelID} | ${dataChannelList2.ChannelList} | ${dataChannelList2.Mention}\`\`\``)
                                        message.channel.send({embeds: [configembed]});
                                    };
                                    if(args[0] === 'addchannel1') {
                                        if(args[1] ) {
                                            dataTwitchChannelAdd = client.getTwitchChannel.get("1")
                                            dataTwitchChannelAdd = { TwitchChannelID: `1`, ChannelList: `${args[1]}`, Mention: '' }
                                            client.setTwitchChannel.run(dataTwitchChannelAdd);
                                            configembed.setDescription(`**Added \`${args[1]}\` to the Twitch Channel 1**\nThe stream will bee fetched at the next refresh round.`)
                                            message.channel.send({embeds: [configembed]});
                                            if(args[2]) {
                                                dataTwitchChannelAdd = { TwitchChannelID: `1`, ChannelList: `${args[1]}`, Mention: `${argsNumber2}` }
                                                client.setTwitchChannel2.run(dataTwitchChannelAdd);
                                            }
                                        };
                                    };
                                    if(args[0] === 'addchannel2') {
                                        if(args[1] ) {
                                            dataTwitchChannelAdd = client.getTwitchChannel.get("2")
                                            dataTwitchChannelAdd = { TwitchChannelID: `2`, ChannelList: `${args[1]}`, Mention: '' }
                                            client.setTwitchChannel.run(dataTwitchChannelAdd);
                                            configembed.setDescription(`**Added \`${args[1]}\` to the Twitch Channel 2**\nThe stream will bee fetched at the next refresh round.`)
                                            message.channel.send({embeds: [configembed]});
                                            if(args[2]) {
                                                dataTwitchChannelAdd = { TwitchChannelID: `2`, ChannelList: `${args[1]}`, Mention: `${argsNumber2}` }
                                                client.setTwitchChannel2.run(dataTwitchChannelAdd);
                                            }
                                        };
                                    };
                                    if(args[0] === 'removechannel1') {
                                        if(args[1]) {
                                            dataRemoveChannel = client.getTwitchChannel.get("1")
                                            client.delTwitchChannel.run(`${dataRemoveChannel}`);
                                            configembed.setDescription(`**Removed \`${dataRemoveChannel.ChannelList}\` from the Twitch Channel List**\nThe stream will keep updating if already live till the stream ended.`)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                    };
                                    if(args[0] === 'removechannel2') {
                                        if(args[1]) {
                                            dataRemoveChannel = client.getTwitchChannel.get("1")
                                            client.delTwitchChannel.run(`${dataRemoveChannel}`);
                                            configembed.setDescription(`**Removed \`${dataRemoveChannel.ChannelList}\` from the Twitch Channel List**\nThe stream will keep updating if already live till the stream ended.`)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                    };
                                    if(args[0] === 'addmention1') {
                                        if(args[2]) {
                                            dataMentionAdd = client.getTwitchChannel.get("1")
                                            dataMentionAdd = { TwitchChannelID: dataMentionAdd.TwitchChannelID, ChannelList: dataMentionAdd.ChannelList, Mention: `${argsNumber2}` }
                                            client.setTwitchChannel2.run(dataMentionAdd);
                                            configembed.setDescription(`**Added \`${args[2]}\` as Mantionable role to \`${dataMentionAdd.ChannelList}\`**`)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                    };
                                    if(args[0] === 'addmention2') {
                                        if(args[2]) {
                                            dataMentionAdd = client.getTwitchChannel.get("2")
                                            dataMentionAdd = { TwitchChannelID: dataMentionAdd.TwitchChannelID, ChannelList: dataMentionAdd.ChannelList, Mention: `${argsNumber2}` }
                                            client.setTwitchChannel2.run(dataMentionAdd);
                                            configembed.setDescription(`**Added \`${args[2]}\` as Mantionable role to \`${dataMentionAdd.ChannelList}\`**`)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                    };
                                    if(args[0] === 'removemention1') {
                                        if(args[1]) {
                                            dataMentionRemove = client.getTwitchChannel.get("1")
                                            dataMentionRemove = { TwitchChannelID: dataMentionRemove.TwitchChannelID, ChannelList: dataMentionRemove.ChannelList, Mention: `` }
                                            client.setTwitchChannel2.run(dataMentionRemove);
                                            configembed.setDescription(`**Removed the Mantionable role from \`${dataMentionRemove.ChannelList}\` **`)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                    };
                                    if(args[0] === 'removemention2') {
                                        if(args[1]) {
                                            dataMentionRemove = client.getTwitchChannel.get("2")
                                            dataMentionRemove = { TwitchChannelID: dataMentionRemove.TwitchChannelID, ChannelList: dataMentionRemove.ChannelList, Mention: `` }
                                            client.setTwitchChannel2.run(dataMentionRemove);
                                            configembed.setDescription(`**Removed the Mantionable role from \`${dataMentionRemove.ChannelList}\` **`)
                                            message.channel.send({embeds: [configembed]});
                                        };
                                    };
                                };
                            } else {
                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.ping.errorperms)));
                            };
                        } else {
                            console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.ping.errorchannel)));
                        };
                    }}};
                };
            };
        };
    }
};
