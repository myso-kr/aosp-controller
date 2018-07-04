'use strict';

var Controller = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var adb;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            adb = _adbkit2.default.createClient();
            return _context.abrupt('return', _bluebird2.default.resolve()
            // .then(() => adb.kill())
            .then(function () {
              return adb.trackDevicesAlways(function (err, tracker) {
                if (err) return process.exit(0);
                var procs = {};
                var procs_update = function procs_update(device) {
                  _database2.default.Devices.find({ id: device.id }).assign(device).write();
                  console.info('Loop Controller Root by ' + device.id + ':' + device.type);
                  switch (device.type) {
                    case 'device':
                      procs[device.id] && procs[device.id] && procs[device.id].stdin && procs[device.id].stdin.pause();
                      procs[device.id] && procs[device.id].kill();
                      procs[device.id] = _child_process2.default.fork(_path2.default.resolve(__dirname, './handler.js'), ['-s', device.id], {
                        cwd: _path2.default.resolve(__dirname, '..')
                      });
                      break;
                    case 'offline':
                      procs[device.id] && procs[device.id] && procs[device.id].stdin && procs[device.id].stdin.pause();
                      procs[device.id] && procs[device.id].kill();
                      break;
                  }
                };
                var procs_unbind = function procs_unbind(device) {
                  procs[device.id] && procs[device.id] && procs[device.id].stdin && procs[device.id].stdin.pause();
                  procs[device.id] && procs[device.id].kill();
                };
                tracker.on('add', procs_update);
                tracker.on('change', procs_update);
                tracker.on('remove', procs_unbind);
              });
            }));

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function Controller() {
    return _ref.apply(this, arguments);
  };
}();

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

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

Controller();