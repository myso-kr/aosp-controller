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
import SSH from 'ssh2';

import ControllerDevice from './aosp-controller-device';

async function hasSSH(address) {
  const ports = await NetScannerPromise({ target: address, port: '22', status: 'O' });
  return !!_.filter(ports, { status: 'open' }).length;
}

async function ssh(address, command) {

}

export default async function ControllerNET(adb, serial) {
  const isNET = serial.indexOf(':5555') != -1;
  if (!isNET) return;

  console.info(`NET handling...`);
  return Promise.resolve()
  .then(async () => {
    const subnet = IP.subnet(serial.replace(':5555', ''), '255.255.255.0');
    console.info(subnet);
  })
  .then(async () => {
    console.info(`Loop Controller NET by ${serial}`);
    const rooted = (await adb.shellWait(serial, `su -c 'echo 1' root`)).toString().trim() == '1';
    await adb.networkWiFi(serial, { state: false });
    await adb.networkCellular(serial, { state: false });
    await adb.networkCellular(serial, { state: true });
    await ControllerDevice(adb, serial, rooted);
  })
  .timeout(1000 * 60 * 3)
  .then(() => ControllerNET(adb, serial))
  .catch((e) => console.error(e))
  // const subnet = IP.subnet(network.address, '255.255.255.0');
  // const gateway = subnet.firstAddress.replace(/\d+$/, 101);
  
  // const devicesList = await adb.listDevices();
  // const devices = await Promise.filter(devicesList, (device) => subnet.contains(device.id.replace(':5555', '')));

  // if(devices.length === 0) return Promise.delay(10000).then(()=>handlerNET(network));
  // logger.info(`NET:${network.address} handling...`);

  // return Promise.resolve()
  // .then(() => hasSSH(gateway))
  // .then((has) => {
  //   if(!has) {
  //     logger.info(`${gateway} is cannot ssh connect!`);
  //   } else {
  //     logger.info(`${gateway} is can ssh connect!`);
  //     return Promise.resolve()
  //     .then(() => ssh(gateway, '/root/reset.sh').timeout(60000))
  //     .then(() => ssh(gateway, 'curl http://checkip.amazonaws.com').timeout(30000))
  //     .then((externalIP) => {
  //       if(!externalIP) {
  //         throw new Error('not resolve external IP');
  //       } else {
  //         logger.info(`${network.address} <-> ${externalIP}`)
  //         return Promise.map(devices, async (device) => {
  //           //await adb.waitForDevice(device.id);
  //           await handlerDevice(device, devicesList);
  //         });
  //       }
  //     })
  //   }
  // })
  // .catch(async (e) => {
  //   logger.error(`${gateway} is error: ${e.message || e} - ${ e.stack }`);
  //   await ssh(gateway, 'reboot').delay(60000)
  // })
  // .finally(() => handlerNET(network)) 
}