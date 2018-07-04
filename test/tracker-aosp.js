import _ from 'lodash';
import Promise from 'bluebird';

import ADB from 'adbkit';
import 'adbkit-evilscan';
import 'adbkit-puppeteer';
import 'adbkit-network-manager';

const interest = require('../interest.json');
const client = ADB.createClient();
client.trackDevices().then(function(tracker) {
  const devices = {};
  tracker.on('add', async (device) => {
    console.log('Device %s was plugged in', device.id);
    
  })
  tracker.on('remove', async (device) => {
    console.log('Device %s was unplugged', device.id);
    devices[device.id] = false;
  })
  tracker.on('end', async () => {
    console.log('Tracking stopped')

  })
})
.catch((err) => console.error('Something went wrong:', err.stack))