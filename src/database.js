import LowDB from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';


class Database {
  constructor() {
    this.fn = 'database.json';
    this.ad = new FileSync(this.fn, {
      defaultValue: {
        devices: []
      }
    });
    this.db = LowDB(this.ad);
  }
  
  get Devices() { return this.db.get('devices'); }
}

module.exports = new Database();