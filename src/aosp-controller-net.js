import console from './logger';

import _ from 'lodash';
import Promise from 'bluebird';

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
import * as SSH from 'ssh2';

import ControllerDevice from './aosp-controller-device';

async function hasSSH(host) {
  const ports = await NetScannerPromise({ target: host, port: '22', status: 'O' });
  return !!_.filter(ports, { status: 'open' }).length;
}

async function ssh(host, command) {
  return new Promise((resolve, reject) => {
    const client = new SSH.Client();
    client.on('error', reject);
    client.on('ready', () => {
      console.info(`SSH:${host} $ ${command}`);
      client.exec(command, (err, stream) => {
        if(err) return reject(err);
        const result = [];
        stream.on('close', () => {
          client.end();
          resolve(result.join('\n'));
        });
        stream.on('data', (data) => {
          const body = data.toString().trim();
          console.info(`SSH:${host} > ${body}`);
          result.push(body);
        });
      });
    });
    client.connect({ host, port: 22, username: 'root', password: '1111' });
  })
}

export default async function ControllerNET(adb, serial) {
  const isNET = serial.indexOf(':5555') != -1;
  if (!isNET) return;

  console.info(`NET handling...`);
  return Promise.resolve()
  .then(async () => {
    try {
      const subnet = IP.subnet(serial.replace(':5555', ''), '255.255.255.0');
      const gateway = subnet.firstAddress.replace(/\d+$/, 2);
      const resetIP = async () => {
        await ssh(gateway, '/root/reset.sh').timeout(60000);
        const externalIP = await ssh(gateway, 'curl http://l2.io/ip').timeout(30000);
        if(!externalIP) return resetIP();
        return externalIP;
      }
      if(await hasSSH(gateway)) return resetIP();
    } catch(e) {
      throw e;
    }
  })
  .timeout(1000 * 60 * 2)
  .then(async (externalIP) => {
    console.info(`Loop Controller NET by ${serial} (${externalIP})`);
    const rooted = (await adb.shellWait(serial, `su -c 'echo 1' root`)).toString().trim() == '1';
    await adb.networkWiFi(serial, { state: false });
    await adb.networkCellular(serial, { state: false });
    await adb.networkCellular(serial, { state: true });
    await ControllerDevice(adb, serial, rooted);
  })
  .timeout(1000 * 60 * 5)
  .catch((e) => console.error(e))
  .finally(() => adb.disconnect(serial))
}