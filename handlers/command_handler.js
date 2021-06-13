const fs = require('fs');
var moment = require('moment');

module.exports = (client, Discord) =>{
    const command_files = fs.readdirSync(`./commands/`).filter(file => file.endsWith('.js'));

    for(const file of command_files){
        const command = require(`../commands/${file}`);
        if(command.name){
            client.commands.set(command.name, command);
        } else {
            continue;
        }
    }
    const load_dir = (dirs) =>{
        const command_files2 = fs.readdirSync(`./commands/${dirs}`).filter(file => file.endsWith('.js'));

        for(const file2 of command_files2){
            const command2 = require(`../commands/${dirs}/${file2}`);

            if(command2.name){
                client.commands.set(command2.name, command2);
            } else {
                continue;
            }
        }
    }
    ['normal', 'admin'].forEach(c => load_dir(c));
    console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][Discord]', 'Command Heandler loaded');
}
