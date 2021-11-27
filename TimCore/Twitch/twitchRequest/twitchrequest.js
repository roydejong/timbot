/* 
Twitch Token Request URL: https://id.twitch.tv/oauth2/authorize?client_id=<YOUR_CLIENT_ID_HERE>&response_type=token&redirect_uri=http://localhost
Luci: https://id.twitch.tv/oauth2/authorize?client_id=yvch0qyixp0dja4tcdrkb5mq3w5vpc&response_type=token&redirect_uri=http://localhost
Angie: https://id.twitch.tv/oauth2/authorize?client_id=41ujxltij9ko1jnwq3cn6mnbwfojl1&response_type=token&redirect_uri=http://localhost
Ice: https://id.twitch.tv/oauth2/authorize?client_id=ososhqgv9mlusw0gfbrzq7f2vqnme3&response_type=token&redirect_uri=http://localhost
 */
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
const twitchrequestread = require('./twitchrequest.json');
const request = require('request');
const fs = require('fs');

const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';
require('dotenv').config();

module.exports = (client, chalk, message, args, Discord) => {
    const SQLite = require("better-sqlite3");
    const sql_Onoff = new SQLite('./Database/sqlite/config/onoff.sqlite');
    client.getOnoffTwitch = sql_Onoff.prepare("SELECT * FROM twitch");
    client.getLang = sql_Onoff.prepare("SELECT * FROM lang");
    for (const row_Twitch of client.getOnoffTwitch./*iterate*/all()) {
    for (const row_lang of client.getLang.all()) {
        let lang = require('../../.' + row_lang.LangSet);
        if(row_Twitch.True === 'true') {
            // const SQLite = require("better-sqlite3");
            const sql = new SQLite('./Database/sqlite/twitch.sqlite');
        
            client.on("ready", () => {
                // Check if the table "points" exists.
                const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'twitchrequest';").get();
                if (!table['count(*)']) {
                    // If the table isn't there, create it and setup the database correctly.
                    sql.prepare("CREATE TABLE twitchrequest (TwitchRequestID TEXT, Token TEXT, Cooldown TEXT);").run();
                    // Ensure that the "id" row is always unique and indexed.
                    sql.prepare("CREATE UNIQUE INDEX idx_twitchrequest_id ON twitchrequest (TwitchRequestID);").run();
                    sql.pragma("synchronous = 1");
                    sql.pragma("journal_mode = wal");
                }
            
                // And then we have two prepared statements to get and set the score data.
                client.getTwitchRequest = sql.prepare("SELECT * FROM twitchrequest WHERE TwitchRequestID = ?");
                client.setTwitchRequest = sql.prepare("INSERT OR REPLACE INTO twitchrequest (TwitchRequestID, Token, Cooldown) VALUES (@TwitchRequestID, @Token, @Cooldown);");
            });

            client.on("ready", () => {
                var requestinterval;
                function requestinterval() {
                    let datatwitchrequest;

                    datatwitchrequest = client.getTwitchRequest.get(client.user.id);

                    if (!datatwitchrequest) {
                        let thentime = DateTime.utc(/*timeNow*/).plus({days: 10/*minutes: 1*/}).toFormat(timeFormat)
                        datatwitchrequest = { TwitchRequestID: `${client.user.id}`, Token: `${twitchrequestread.twitch_oauth_token}`, Cooldown: `${thentime}` }
                        client.setTwitchRequest.run(datatwitchrequest);
                    }
                    // console.log(datatwitchrequest.Cooldown);
                    // console.log(DateTime.utc().toFormat('MM/DD/YYYY-hh:mm:ss-A'));
                    if (DateTime.utc().toFormat(timeFormat) < datatwitchrequest.Cooldown) {
                        return;
                    } else {
                        const options = {
                            url: 'https://id.twitch.tv/oauth2/token',
                            json:true,
                            body: {
                                client_id: process.env.TWITCH_CLIENT_ID,
                                client_secret: process.env.TWITCH_CLIENT_SECRET,
                                grant_type: 'client_credentials'
                            }
                        };
                        request.post(options, (err,res,body)=>{
                            // console.log(res)
                            if(err){
                                return console.log(err);
                            }
                            let timethen = DateTime.utc().plus({days: 10/*minutes: 1*/}).toFormat(timeFormat)
                            // .json backup
                            let requestjsonrawdata = fs.readFileSync(`./TimCore/Twitch/twitchRequest/twitchrequest.json`);
                            let requestjsonread = JSON.parse(requestjsonrawdata);
                            requestjsonread.twitch_oauth_token = body.access_token
                            requestjsonread.twitch_oauth_cooldown = timethen
                            let datajsonrequest = JSON.stringify(requestjsonread, null, 2);
                            fs.writeFileSync(`./TimCore/Twitch/twitchRequest/twitchrequest.json`, datajsonrequest, function (err){
                                if (err) throw err;
                                console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.tim, err));
                            });
                            // sqlite
                            datatwitchrequest = { TwitchRequestID: `${client.user.id/*datatwitchrequest.TwitchRequestID*/}`, Token: `${body.access_token}`, Cooldown: `${timethen}` }
                            client.setTwitchRequest.run(datatwitchrequest);
                            console.log(chalk.cyan('[' + DateTime.utc().toFormat(timeFormat) + ']' + lang.prefix.tim, `New Token for Twitch created, next request on '${timethen}'.`));
                        });
                    }
                }                           /* 1 min ,  1 hour ,  12 hour ,  1 day ,   30 days */
                setInterval(requestinterval, 60000/*3600000/*43200000*//*86400000*//*2592000000*/);
            });
        }
    }}
}
