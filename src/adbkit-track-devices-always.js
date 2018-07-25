import console from './logger';

import _ from 'lodash';
import Promise from 'bluebird';
import EventEmitter from 'events';

import OS from 'os';
import IP from 'ip';
import NetScanner from 'evilscan';
const NetScannerPromise = ((options) => {
  return new Promise((resolve, reject) => {
    const result = [];
    const scanner = new NetScanner(options);
    scanner.on('error', reject);
    scanner.on('result', (data) => result.push(data));
    scanner.on('done', () => resolve(result));
    scanner.run();
  });
});

import Client from 'adbkit/lib/adb/client';
if(!Client.prototype.trackDevicesAlways) {
  Client.prototype.trackDevicesAlways = function(callback) {
    return Promise.resolve().then(async () => {
      const trackerAlways = new EventEmitter();
      const trackerRepeater = () => {
        return Promise.resolve()
        .then(() => this.trackDevices())
        .then((tracker) => {
          tracker.on('add'   , (...args) => trackerAlways.emit('add'   , ...args));
          tracker.on('change', (...args) => trackerAlways.emit('change', ...args));
          tracker.on('changeSet', (...args) => trackerAlways.emit('changeSet', ...args));
          tracker.on('remove', (...args) => trackerAlways.emit('remove', ...args));
          tracker.on('end'   , (...args) => trackerAlways.emit('end'   , ...args));
          tracker.on('error' , (...args) => trackerAlways.emit('error', ...args));
        })
        .catch((e) => Promise.delay(5000).then(trackerRepeater));
      }
      const networkRepeater = () => {
        const networks = _.reduce(OS.networkInterfaces(), (o, networks) => {
          const network = _.find(networks, { family: 'IPv4', internal: false });
          return network ? o.concat([`${network.address}/24`]) : o;
        }, []);
        return Promise.map(networks, async (subnet) => {
          // console.info(`Scanner on ${subnet}`);
          const devices_connected = await this.listDevices();
          const devices = await NetScannerPromise({ target: subnet, port: '5555', status: 'O' });
          return Promise.mapSeries(devices, (device) => {
            if(device.status == 'open' && !_.find(devices_connected, { id: device.id })) {
              console.info(`Find on ${subnet} > ${device.ip}:${device.port}, ${device.status}`);
              return this.connect(device.ip, device.port).catch(()=>{})
            }
          });
        })
        .finally((e) => Promise.delay(5000).then(networkRepeater));
      }
      setTimeout(() => trackerRepeater());
      setTimeout(() => Promise.map(this.listDevices(), (device) => trackerAlways.emit('add', device)).then(() => networkRepeater()), 1000);
      return trackerAlways;
    }).nodeify(callback);
  }  
}