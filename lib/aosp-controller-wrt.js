'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _ssh = require('ssh2');

var _ssh2 = _interopRequireDefault(_ssh);

var _evilscan = require('evilscan');

var _evilscan2 = _interopRequireDefault(_evilscan);

var _aospControllerDevice = require('./aosp-controller-device');

var _aospControllerDevice2 = _interopRequireDefault(_aospControllerDevice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(adb, filter) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function ControllerWRT(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return ControllerWRT;
}();