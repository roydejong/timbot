// DiscordJS
const Discord = require('discord.js');
const { Intents, Collection } = Discord;
const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        /*Intents.FLAGS.GUILD_INTEGRATIONS,*/
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ], 
    partials: ["GUILD_MEMBER"]
});
//Discord const
require('dotenv').config();
const chalk = require('chalk');
const timeFormat = 'yyyy'+'/'+'LL'+'/'+'dd'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
const { DateTime } = require('luxon');
console.log('[Time]', DateTime.utc().toISO(), '[UTC]');

//Start
console.log(chalk.yellow('[NodeJS]' + chalk.white(' ▪ ▪ ▪ ▪ ▪ ', 'DiscordBot Start', ' ▪ ▪ ▪ ▪ ▪ ')));

    client.commands = new Collection();
    client.cooldowns = new Collection();
    ['admin_command_handler', 'event_handler'].forEach(handler =>{
        require(`./TimCore/Commen/handlers/${handler}`)(client, chalk, Discord);
    });
    client.twitch = new Collection();
    ['twitchrequest'].forEach(request =>{
        require(`./TimCore/Twitch/twitchRequest/${request}.js`)(client, chalk, Discord);
    });
    ['twitch'].forEach(Live =>{
        require(`./TimCore/Twitch/${Live}.js`)(client, chalk, Discord);
    });
    client.reaction = new Collection();
    ['words'].forEach(wordreaction =>{
        require(`./TimSys/commands/react/${wordreaction}.js`)(client, chalk, Discord);
    });

    //Login
    client.login(process.env.TOKEN);

//Error listener
client.on('unhandledRejection', error => {
    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.error.unhandled), chalk.white(error));
});
client.on('shardError', error => {
    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.error.websocket), chalk.white(error));
});

// //--------END--------//
