const fs = require('fs');

class MiniDb {
  constructor(name) {
    this.basePath = `${__dirname}/data/${name}`;

    if (!fs.existsSync(this.basePath)){
      console.log('[MiniDb]', 'Create base directory:', this.basePath);
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
      console.log('[MiniDb]', 'Read error:', filePath, e);
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
      console.log('[MiniDb]', 'Wrote output file:', filePath);
      return true;
    } catch (e) {
      return false;
    }
  }
}

module.exports = MiniDb;