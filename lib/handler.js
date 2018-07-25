'use strict';

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _adbkit = require('adbkit');

var _adbkit2 = _interopRequireDefault(_adbkit);

require('./adbkit-shell-wait');

require('./adbkit-network-manager');

require('./adbkit-track-devices-always');

require('./adbkit-chrome-remote-interface');

var _aospControllerUsb = require('./aosp-controller-usb');

var _aospControllerUsb2 = _interopRequireDefault(_aospControllerUsb);

var _aospControllerNet = require('./aosp-controller-net');

var _aospControllerNet2 = _interopRequireDefault(_aospControllerNet);

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var optionDefinitions = [];
optionDefinitions.push({ name: 'serial', alias: 's', type: String });
var argv = (0, _commandLineArgs2.default)(optionDefinitions);

var adb = _adbkit2.default.createClient();
if (argv.serial) {
  _logger2.default.info('Loop Controller Main by ' + argv.serial);
  var isUSB = argv.serial.indexOf(':5555') == -1;
  if (isUSB) (0, _aospControllerUsb2.default)(adb, argv.serial);
  if (!isUSB) (0, _aospControllerNet2.default)(adb, argv.serial);
}