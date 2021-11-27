
const { MessageEmbed } = require('discord.js');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
require('dotenv').config();

module.exports = {
    name: 'role',
    aliases: ['roles'],
    description: 'editing stuff',
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
                                if(client) {
                                    const configembed = new MessageEmbed()
                                    .setColor('DARK_GREEN')
                                    .setTitle('Configs - Roles')
                                    if(!args[0]) {
                                        configembed.setDescription('**' + lang.admin.config.noargs1 + `\`${prefix}config list\`` + lang.admin.config.noargs2 + '**')
                                        message.channel.send({embeds: [configembed]});
                                    }
                                    if(args[0] === 'help' || args[0] === 'command' || args[0] === 'commands' || args[0] === 'list') {
                                        configembed.setDescription(lang.admin.config.list)
                                        message.channel.send({embeds: [configembed]});
                                    }
                                    const sql_ChannelRole2 = new SQLite('./Database/sqlite/config/channelRole.sqlite');
                                    if(client) {
                                        client.setRoleAdmin = sql_ChannelRole2.prepare("REPLACE INTO role_admin (ChannelRoleID, Admin1, Admin2, Admin3, Admin4, Admin5, Admin6, Admin7, Admin8, Admin9) VALUES (@ChannelRoleID, @Admin1, @Admin2, @Admin3, @Admin4, @Admin5, @Admin6, @Admin7, @Admin8, @Admin9);");
                                    };
                                    //
                                    // Admin
                                    if(args[0] === 'admin1') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin1;
                                            if(!dataRoleAdmin1) {
                                                dataRoleAdmin1 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: `${args[1]}`, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin1)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin1;
                                            if(!dataRoleAdmin1) {
                                                dataRoleAdmin1 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: `100000000000000000`, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin1)
                                        }
                                    }
                                    if(args[0] === 'admin2') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin2;
                                            if(!dataRoleAdmin2) {
                                                dataRoleAdmin2 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: `${args[1]}`, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin2)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin2;
                                            if(!dataRoleAdmin2) {
                                                dataRoleAdmin2 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: `100000000000000000`, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin2)
                                        }
                                    }
                                    if(args[0] === 'admin3') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin3;
                                            if(!dataRoleAdmin3) {
                                                dataRoleAdmin3 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: `${args[1]}`, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin3)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin3;
                                            if(!dataRoleAdmin3) {
                                                dataRoleAdmin3 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: `100000000000000000`, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin3)
                                        }
                                    }
                                    if(args[0] === 'admin4') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin4;
                                            if(!dataRoleAdmin4) {
                                                dataRoleAdmin4 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: `${args[1]}`, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin4)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin4;
                                            if(!dataRoleAdmin4) {
                                                dataRoleAdmin4 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: `100000000000000000`, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin4)
                                        }
                                    }
                                    if(args[0] === 'admin5') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin5;
                                            if(!dataRoleAdmin5) {
                                                dataRoleAdmin5 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: `${args[1]}`, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin5)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin5;
                                            if(!dataRoleAdmin5) {
                                                dataRoleAdmin5 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: `100000000000000000`, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin5)
                                        }
                                    }
                                    if(args[0] === 'admin6') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin6;
                                            if(!dataRoleAdmin6) {
                                                dataRoleAdmin6 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: `${args[1]}`, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin6)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin6;
                                            if(!dataRoleAdmin6) {
                                                dataRoleAdmin6 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: `100000000000000000`, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin6)
                                        }
                                    }
                                    if(args[0] === 'admin7') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin7;
                                            if(!dataRoleAdmin7) {
                                                dataRoleAdmin7 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: `${args[1]}`, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin7)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin7;
                                            if(!dataRoleAdmin7) {
                                                dataRoleAdmin7 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: `100000000000000000`, Admin8: row_RoleAdmin.Admin8, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin7)
                                        }
                                    }
                                    if(args[0] === 'admin8') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin8;
                                            if(!dataRoleAdmin8) {
                                                dataRoleAdmin8 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: `${args[1]}`, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin8)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin8;
                                            if(!dataRoleAdmin8) {
                                                dataRoleAdmin8 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: `100000000000000000`, Admin9: row_RoleAdmin.Admin9 }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin8)
                                        }
                                    }
                                    if(args[0] === 'admin9') {
                                        if(typeof args[1] != "number" ) {
                                            let dataRoleAdmin9;
                                            if(!dataRoleAdmin9) {
                                                dataRoleAdmin9 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: `${args[1]}` }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin9)
                                        } else if(args[1] === 'delete') {
                                            let dataRoleAdmin9;
                                            if(!dataRoleAdmin9) {
                                                dataRoleAdmin9 = { ChannelRoleID: row_RoleAdmin.ChannelRoleID, Admin1: row_RoleAdmin.Admin1, Admin2: row_RoleAdmin.Admin2, Admin3: row_RoleAdmin.Admin3, Admin4: row_RoleAdmin.Admin4, Admin5: row_RoleAdmin.Admin5, Admin6: row_RoleAdmin.Admin6, Admin7: row_RoleAdmin.Admin7, Admin8: row_RoleAdmin.Admin8, Admin9: `100000000000000000` }
                                            }
                                            client.setRoleAdmin.run(dataRoleAdmin9)
                                        }
                                    }
                                }
                            } else {
                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.ping.errorperms)));
                            }
                        } else {
                            console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.clan, chalk.white(lang.admin.ping.errorchannel)));
                        }
                    }}
                }
            }
        }
    }
}