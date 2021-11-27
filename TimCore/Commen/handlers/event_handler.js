
const { readdirSync } = require('fs');
const { DateTime } = require('luxon');
const timeFormat = 'LL'+'/'+'dd'+'/'+'yyyy'+'-'+'h'+':'+'mm'+':'+'ss'+'-'+'a';

module.exports = (client, chalk, Discord) =>{
    const eventFolders = readdirSync('./TimCore/Commen/events');
    for (const folder of eventFolders) {
        const eventFiles = readdirSync(`./TimCore/Commen/events/${folder}`).filter(files => files.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`../events/${folder}/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client, Discord));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client, Discord));
            };
        };
    };
    console.log(chalk.yellow('[' + DateTime.utc().toFormat(timeFormat) + '][Discord]', chalk.white('Event Heandler loaded')));
};
