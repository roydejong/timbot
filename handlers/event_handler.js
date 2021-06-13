const fs = require('fs');
var moment = require('moment');

module.exports = (client, Discord) =>{
    const load_dir = (dirs) =>{
        const event_files = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for(const file of event_files){
            const event = require(`../events/${dirs}/${file}`);
            const event_name = file.split('.')[0];
            client.on(event_name, event.bind(null, Discord, client))
        }
    }
    ['client', 'guild'].forEach(e => load_dir(e));
    console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][Discord]', 'Event Heandler loaded');
}
