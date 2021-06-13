const fs = require('fs');
const moment = require('moment');

class MiniDb {
  constructor(name) {
    this.basePath = `${__dirname}/data/${name}`;

    if (!fs.existsSync(this.basePath)){
      console.log('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][MiniDb]', 'Create base directory:', this.basePath);
      fs.mkdirSync(this.basePath);
    }
  }

  get(id) {
    const filePath = `${this.basePath}/${id}.json`;

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, {
          encoding: 'utf8',
          flag: 'r'
        });
        return JSON.parse(raw) || null;
      }
    } catch (e) {
      console.error('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][MiniDb]', 'Write error:', filePath, e);
    }
    return null;
  }

  put(id, value) {
    const filePath = `${this.basePath}/${id}.json`;

    try {
      const raw = JSON.stringify(value);
      fs.writeFileSync(filePath, raw, {
        encoding: 'utf8',
        mode: '666',
        flag: 'w'
      });
      return true;
    } catch (e) {
      console.error('[' + moment.utc().format('MM/DD/YYYY-h:mm:ss-A') + '][MiniDb]', 'Write error:', filePath, e);
      return false;
    }
  }
}

module.exports = MiniDb;
