'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _aospControllerDevice = require('./aosp-controller-device');

var _aospControllerDevice2 = _interopRequireDefault(_aospControllerDevice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(adb, serial) {
    var _this = this;

    var isUSB;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            isUSB = serial.indexOf(':5555') == -1;

            if (isUSB) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt('return');

          case 3:

            _logger2.default.info('USB handling...');
            return _context2.abrupt('return', _bluebird2.default.resolve().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              var rooted;
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _logger2.default.info('Loop Controller USB by ' + serial);
                      _context.next = 3;
                      return adb.shellWait(serial, 'su -c \'echo 1\' root');

                    case 3:
                      _context.t0 = _context.sent.toString().trim();
                      rooted = _context.t0 == '1';
                      _context.next = 7;
                      return adb.networkWiFi(serial, { state: false });

                    case 7:
                      _context.next = 9;
                      return adb.networkCellular(serial, { state: false });

                    case 9:
                      _context.next = 11;
                      return adb.networkCellular(serial, { state: true });

                    case 11:
                      _context.next = 13;
                      return (0, _aospControllerDevice2.default)(adb, serial, rooted);

                    case 13:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, _this);
            }))).timeout(1000 * 60 * 5).then(function () {
              return ControllerUSB(adb, serial);
            }).catch(function (e) {
              return _logger2.default.error(e);
            }));

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function ControllerUSB(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return ControllerUSB;
}();