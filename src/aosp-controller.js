import console from './logger';

import _ from 'lodash';
import Promise from 'bluebird';

import ChildProcess from 'child_process';
import Path from 'path';

import ADB from 'adbkit';
import './adbkit-shell-wait';
import './adbkit-network-manager';
import './adbkit-track-devices-always';
import './adbkit-chrome-remote-interface';

import ControllerUSB from './aosp-controller-usb';
import ControllerNET from './aosp-controller-net';

import Database from './database';

async function Controller() {
  const adb = ADB.createClient();
  return Promise.resolve()
  // .then(() => adb.kill())
  .then(() => adb.trackDevicesAlways((err, tracker) => {
    if(err) return process.exit(0);
    const procs = {};
    const procs_update = (device) => {
      Database.Devices.find({ id: device.id }).assign(device).write();
      console.info(`Loop Controller Root by ${device.id}:${device.type}`);
      switch(device.type) {
        case 'device':
          procs[device.id] && procs[device.id] && procs[device.id].stdin && procs[device.id].stdin.pause();
          procs[device.id] && procs[device.id].kill();
          procs[device.id] = ChildProcess.fork(Path.resolve(__dirname, './handler.js'), ['-s', device.id], { 
            cwd: Path.resolve(__dirname, '..'),
          });
          procs[device.id].on('error', () => { procs[device.id] && procs[device.id].kill(); })
        break;
        case 'offline':
          procs[device.id] && procs[device.id] && procs[device.id].stdin && procs[device.id].stdin.pause();
          procs[device.id] && procs[device.id].kill();
        break;
      }
      
    }
    const procs_unbind = (device) => {
      procs[device.id] && procs[device.id] && procs[device.id].stdin && procs[device.id].stdin.pause();
      procs[device.id] && procs[device.id].kill();
    }
    tracker.on('add', procs_update);
    tracker.on('change', procs_update);
    tracker.on('remove', procs_unbind);
  }))
}

Controller();