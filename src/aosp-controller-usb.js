import console from './logger';

import _ from 'lodash';
import Promise from 'bluebird';

import ControllerDevice from './aosp-controller-device';

export default async function ControllerUSB(adb, serial) {
  const isUSB = serial.indexOf(':5555') == -1;
  if (!isUSB) return;

  console.info(`USB handling...`);
  return Promise.resolve()
  .then(async () => {
    console.info(`Loop Controller USB by ${serial}`);
    const rooted = (await adb.shellWait(serial, `su -c 'echo 1' root`)).toString().trim() == '1';
    await adb.networkWiFi(serial, { state: false });
    await adb.networkCellular(serial, { state: false });
    await adb.networkCellular(serial, { state: true });
    await ControllerDevice(adb, serial, rooted);
  })
  .timeout(1000 * 60 * 5)
  .then(() => ControllerUSB(adb, serial))
  .catch((e) => console.error(`${serial} > ${e.message}`))
}