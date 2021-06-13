var moment = require('moment');

module.exports = () =>{
    console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '] Im ready!');
}
