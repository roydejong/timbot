
const chalk = require('chalk');
const fs = require('fs');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';

module.exports = (client, Discord) =>{
    const load_dir = (dirs) =>{
        const command_files2 = fs.readdirSync(`./TimSys/commands/admin/${dirs}`).filter(file2 => file2.endsWith('.js'));

        for(const file2 of command_files2){
            const command2 = require(`../../../TimSys/commands/admin/${dirs}/${file2}`);
            
            if(command2.name){
                client.commands.set(command2.name, command2);
            } else {
                continue;
            }
        }
    }
    ['master', 'edit'].forEach(c => load_dir(c));
    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]', chalk.white('Admin Command Heandler loaded')));
}
