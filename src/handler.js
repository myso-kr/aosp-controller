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

import commandLineArgs from 'command-line-args';
const optionDefinitions = [];
optionDefinitions.push({ name: 'serial', alias: 's', type: String });
const argv = commandLineArgs(optionDefinitions);

const adb = ADB.createClient();
if(argv.serial) {
  console.info(`Loop Controller Main by ${argv.serial}`);
  const isUSB = argv.serial.indexOf(':5555') == -1;
  if( isUSB) ControllerUSB(adb, argv.serial);
  if(!isUSB) ControllerNET(adb, argv.serial);

  process.stdin.resume();
  function exitHandler(options, err) {
      if (err) console.error(err.stack);
      if (options.exit) process.exit();
  }
  process.on('exit', exitHandler.bind(null,{cleanup:true}));
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
}