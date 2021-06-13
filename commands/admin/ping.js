const configmain = require('../../config/config.json');
const configrole = require('../../config/roles.json');
//const Math = require('mathjs');
var moment = require('moment');

module.exports = {
    name: 'ping',
    aliases: ['pong'],
    description: 'pinging',
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
				//Math.floor(pingmsg.createdAt - message.createdAt)
				message.channel.send(`Fuck off! I\'m busy! -.-* \nBot to User ${Date.now() - message.createdTimestamp}ms \nBot to Discord ${Math.round(client.ws.ping)}ms`);
				console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', 'admin command \'ping\' executed');
			} else {
				console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', 'admin command \'ping\' failed. Missing permissions!');
			}
		// } else {
		//     console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][TimBot]', 'admin command \'ping\' failed. Wrong Channel!');
		// }
	}
}
