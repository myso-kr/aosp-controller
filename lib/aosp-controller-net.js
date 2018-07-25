'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var hasSSH = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(host) {
    var ports;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return NetScannerPromise({ target: host, port: '22', status: 'O' });

          case 2:
            ports = _context.sent;
            return _context.abrupt('return', !!_lodash2.default.filter(ports, { status: 'open' }).length);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function hasSSH(_x) {
    return _ref.apply(this, arguments);
  };
}();

var ssh = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(host, command) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt('return', new _bluebird2.default(function (resolve, reject) {
              var client = new SSH.Client();
              client.on('error', reject);
              client.on('ready', function () {
                _logger2.default.info('SSH:' + host + ' $ ' + command);
                client.exec(command, function (err, stream) {
                  if (err) return reject(err);
                  var result = [];
                  stream.on('close', function () {
                    client.end();
                    resolve(result.join('\n'));
                  });
                  stream.on('data', function (data) {
                    var body = data.toString().trim();
                    _logger2.default.info('SSH:' + host + ' > ' + body);
                    result.push(body);
                  });
                });
              });
              client.connect({ host: host, port: 22, username: 'root', password: '1111' });
            }));

          case 1:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function ssh(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _evilscan = require('evilscan');

var _evilscan2 = _interopRequireDefault(_evilscan);

var _ssh = require('ssh2');

var SSH = _interopRequireWildcard(_ssh);

var _aospControllerDevice = require('./aosp-controller-device');

var _aospControllerDevice2 = _interopRequireDefault(_aospControllerDevice);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var NetScannerPromise = function NetScannerPromise(options) {
  return new _bluebird2.default(function (resolve, reject) {
    var result = [];
    var scanner = new _evilscan2.default(options);
    scanner.on('error', reject);
    scanner.on('result', function (data) {
      return result.push(data);
    });
    scanner.on('done', function () {
      return resolve(result);
    });
    scanner.run();
  });
};

exports.default = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(adb, serial) {
    var _this = this;

    var isNET;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            isNET = serial.indexOf(':5555') != -1;

            if (isNET) {
              _context6.next = 3;
              break;
            }

            return _context6.abrupt('return');

          case 3:

            _logger2.default.info('NET handling...');
            return _context6.abrupt('return', _bluebird2.default.resolve().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
              var subnet, gateway, resetIP;
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      _context4.prev = 0;
                      subnet = _ip2.default.subnet(serial.replace(':5555', ''), '255.255.255.0');
                      gateway = subnet.firstAddress.replace(/\d+$/, 2);

                      resetIP = function () {
                        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                          var externalIP;
                          return regeneratorRuntime.wrap(function _callee3$(_context3) {
                            while (1) {
                              switch (_context3.prev = _context3.next) {
                                case 0:
                                  _context3.next = 2;
                                  return ssh(gateway, '/root/reset.sh').timeout(60000);

                                case 2:
                                  _context3.next = 4;
                                  return ssh(gateway, 'curl http://195.80.156.69/ip').timeout(30000);

                                case 4:
                                  externalIP = _context3.sent;

                                  if (externalIP) {
                                    _context3.next = 7;
                                    break;
                                  }

                                  return _context3.abrupt('return', resetIP());

                                case 7:
                                  return _context3.abrupt('return', externalIP);

                                case 8:
                                case 'end':
                                  return _context3.stop();
                              }
                            }
                          }, _callee3, _this);
                        }));

                        return function resetIP() {
                          return _ref5.apply(this, arguments);
                        };
                      }();

                      _context4.next = 6;
                      return hasSSH(gateway);

                    case 6:
                      if (!_context4.sent) {
                        _context4.next = 8;
                        break;
                      }

                      return _context4.abrupt('return', resetIP());

                    case 8:
                      _context4.next = 13;
                      break;

                    case 10:
                      _context4.prev = 10;
                      _context4.t0 = _context4['catch'](0);
                      throw _context4.t0;

                    case 13:
                    case 'end':
                      return _context4.stop();
                  }
                }
              }, _callee4, _this, [[0, 10]]);
            }))).timeout(1000 * 60 * 2).then(function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(externalIP) {
                var rooted;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _logger2.default.info('Loop Controller NET by ' + serial + ' (' + externalIP + ')');
                        _context5.next = 3;
                        return adb.shellWait(serial, 'su -c \'echo 1\' root');

                      case 3:
                        _context5.t0 = _context5.sent.toString().trim();
                        rooted = _context5.t0 == '1';
                        _context5.next = 7;
                        return adb.networkWiFi(serial, { state: false });

                      case 7:
                        _context5.next = 9;
                        return adb.networkCellular(serial, { state: false });

                      case 9:
                        _context5.next = 11;
                        return adb.networkCellular(serial, { state: true });

                      case 11:
                        _context5.next = 13;
                        return (0, _aospControllerDevice2.default)(adb, serial, rooted);

                      case 13:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, _this);
              }));

              return function (_x6) {
                return _ref6.apply(this, arguments);
              };
            }()).timeout(1000 * 60 * 5).catch(function (e) {
              return _logger2.default.error(e);
            }).finally(function () {
              return adb.disconnect(serial);
            }));

          case 5:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  function ControllerNET(_x4, _x5) {
    return _ref3.apply(this, arguments);
  }

  return ControllerNET;
}();