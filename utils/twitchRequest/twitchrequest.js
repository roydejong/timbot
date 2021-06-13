const configmain = require('../../config/config.json');
const request = require('request');
const fs = require('fs');

var moment = require('moment');
var timeNow = moment.utc().format('MM/DD/YYYY-hh:mm:ss-a');

module.exports = (client, message, args, Discord) => {
    var requestinterval
    client.on('ready', () => {
        requestinterval = setInterval(() => {
            try {
                // // make Promise version of fs.readdir()
                // fs.readdirAsync = function(dirname) {
                //     return new Promise(function(resolve, reject) {
                //         fs.readdir(dirname, function(err, filenames){
                //             if (err) 
                //                 reject(err); 
                //             else 
                //                 resolve(filenames);
                //         });
                //     });
                // };

                // make Promise version of fs.readFile()
                // fs.readFileAsync = function(filename, enc) {
                //     return new Promise(function(resolve, reject) {
                    let configrawdata = fs.readFileSync('./config/config.json');
                    let configread = JSON.parse(configrawdata);
                    let requestcooldown = configread.oauth2.twitch_oauth_cooldown;
                    if (timeNow < requestcooldown) {
                        return;
                    } else {
                        const options = {
                            url: 'https://id.twitch.tv/oauth2/token',
                            json:true,
                            body: {
                                client_id: configmain.oauth2.twitch_client_id,
                                client_secret: configmain.oauth2.twitch_client_secret,
                                grant_type: 'client_credentials'
                            }
                        };
                        let timethen = moment.utc().add(50, 'days').format('MM/DD/YYYY-hh:mm:ss-a')
                        configmain.oauth2.twitch_oauth_token = res.body.access_token;
                        configmain.oauth2.twitch_oauth_cooldown = timethen;
                        let datarequest = JSON.stringify(requestread, null, 2);
                        fs.writeFileSync(`./config/config.json`, datarequest);
                        console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', `New Token for Twitch created, next request on '${timethen}'.`);
                    };
                    message.channel.send('New Twitch oauth2 Token. Restarting...')
                    const { exec } = require("child_process");
                    exec("pm2 restart clanBot", (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                //     });
                // };
                // utility function, return Promise
                // function getFile(filename) {
                //     return fs.readFileAsync(filename, 'utf8');
                // }
                // // a function specific to my project to filter out the files I need to read and process, you can pretty much ignore or write your own filter function.
                // function isDataFile(filename) {
                //     return (filename.split('.')[1] == 'json')
                // }
                // // read all json files in the directory, filter out those needed to process, and using Promise.all to time when all async readFiles has completed.
                // fs.readdirAsync('./config').then(function (filenames){
                //     filenames = filenames.filter(isDataFile);
                //     return Promise.all(filenames.map(getFile));
                // })
            }catch(error){
                console.log(error)
            }
        }, 86400000);
    })
}
