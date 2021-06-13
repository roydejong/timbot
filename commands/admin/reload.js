const configmain = require('../../config/config.json');
const configrole = require('../../config/roles.json');
const fs = require( 'fs' );
const path = require( 'path' );
var moment = require('moment');

module.exports = {
    name: 'reload',
    aliases: ['loadnew', 'rl'],
    description: "Reloads commands",
    guildOnly: true,
    async execute(client, message, args) {
        // const adminchannel1 = configchannel.admin.admin1;
        // const adminchannel2 = configchannel.admin.admin2;
        // const adminchannel3 = configchannel.admin.admin3;
        // const adminchannel4 = configchannel.admin.admin4;
        // const adminchannel5 = configchannel.admin.admin5;
        const admin1 = configrole.admin.admin1;
        const admin2 = configrole.admin.admin2;
        const admin3 = configrole.admin.admin3;
        const admin4 = configrole.admin.admin4;
        const admin5 = configrole.admin.admin5;
        // if(message.channel.id === adminchannel1 || message.channel.id === adminchannel2 || message.channel.id === adminchannel3 || message.channel.id === adminchannel4 || message.channel.id === adminchannel5) {
            if(message.member.roles.cache.has(admin1) || message.member.roles.cache.has(admin2) || message.member.roles.cache.has(admin3) || message.member.roles.cache.has(admin4) || message.member.roles.cache.has(admin5)) {
                if(!args[0]) return message.channel.send('Please provide a command to reload!');
                if (!args.length) return message.channel.send('You didn\'t pass any command to reload!');
                try{
                    const commandName = args[0].toLowerCase();
                    const command1 = message.client.commands.get(commandName) ||
                    message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                    const getAllFiles = function(dirPath, arrayOfFiles) {
                        files = fs.readdirSync(dirPath);
                        arrayOfFiles = arrayOfFiles || []
                        files.forEach(function(file) {
                            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                            } else {
                                // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
                                arrayOfFiles.push(path.join(dirPath, "/", file))
                            }
                        })
                        return arrayOfFiles
                    }
                    const results = getAllFiles("./commands/")
                    let filterjs = results.filter(result => result.endsWith(`\\${commandName}.js`))
                    if(!filterjs === []) {
                        const arr = filterjs;
                        const index = arr.filter((el) => el === '\\');
                        arr[index] = '/';
                        arr;
                        delete require.cache[require.resolve(`../../../${arr}`)];
                        const newCommand = require(`../../../${arr}`);
                        message.client.commands.set(commandName, newCommand);
                        message.channel.send(`Command ${commandName} was reloaded!`);
                        console.log(`Command ${commandName} was reloaded!`);
                    } else {}
                    console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', 'No Command found.');
                } catch (error) {
                    console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', error);
                }
            } else {
                console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', 'admin command \'reload\' failed. Missing permissions!');
            }
        // } else {
        //     console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', 'admin command \'reload\' failed. Wrong Channel!');
        // }
    }
}
