const chalk = require('chalk');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';

module.exports = {
    name: 'ready',
    execute(client){
        console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]'), chalk.white(`logged in as ${client.user.tag}.`));
        client.user.setActivity('Tamani Wolf', {type: 'LISTENING'});
    }
};
