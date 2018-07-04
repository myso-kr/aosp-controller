import _ from 'lodash';
import Promise from 'bluebird';

import IP from 'ip';

import ControllerDevice from './aosp-controller-device';

export default async function ControllerNET(adb, serial) {
  const isNET = serial.indexOf(':5555') != -1;
  if (!isNET) return;

  console.info(`NET handling...`);
  return Promise.resolve()
  .then(async () => {
    console.info(`Loop Controller NET by ${serial}`);
    const rooted = (await adb.shellWait(serial, `su -c 'echo 1' root`)).toString().trim() == '1';
    await adb.networkWiFi(serial, { state: false });
    await adb.networkCellular(serial, { state: false });
    await adb.networkCellular(serial, { state: true });
    await ControllerDevice(adb, serial, rooted);
  })
  .catch((e)=>console.error(e))
  .finally(() => ControllerNET(adb, serial))
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