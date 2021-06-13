const configmain = require('../../config/config.json');
var moment = require('moment');

module.exports = async (Discord, client, message) => {
    const prefix = configmain.prefix;

    if(!message.content.startsWith(prefix) || message.author.bot) return;
            if (!message.author.bot) {
                if (message.content) {
                    
                }
            }

    //Args + Command + ALiases
    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd)
                    || client.commands.find(a => a.aliases && a.aliases.includes(cmd));

    //
    
    
    //Execute
    try{
    if(command) command.execute(client, message, args, Discord);
    } catch (error){
        message.reply('There was an error trying to execute this command!');
        console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + ']', error);
    }

}
