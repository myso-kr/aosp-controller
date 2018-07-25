'use strict';

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _evilscan = require('evilscan');

var _evilscan2 = _interopRequireDefault(_evilscan);

var _client = require('adbkit/lib/adb/client');

var _client2 = _interopRequireDefault(_client);

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

if (!_client2.default.prototype.trackDevicesAlways) {
  _client2.default.prototype.trackDevicesAlways = function (callback) {
    var _this = this;

    return _bluebird2.default.resolve().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var trackerAlways, trackerRepeater, networkRepeater;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              trackerAlways = new _events2.default();

              trackerRepeater = function trackerRepeater() {
                return _bluebird2.default.resolve().then(function () {
                  return _this.trackDevices();
                }).then(function (tracker) {
                  tracker.on('add', function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                      args[_key] = arguments[_key];
                    }

                    return trackerAlways.emit.apply(trackerAlways, ['add'].concat(args));
                  });
                  tracker.on('change', function () {
                    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      args[_key2] = arguments[_key2];
                    }

                    return trackerAlways.emit.apply(trackerAlways, ['change'].concat(args));
                  });
                  tracker.on('changeSet', function () {
                    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                      args[_key3] = arguments[_key3];
                    }

                    return trackerAlways.emit.apply(trackerAlways, ['changeSet'].concat(args));
                  });
                  tracker.on('remove', function () {
                    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                      args[_key4] = arguments[_key4];
                    }

                    return trackerAlways.emit.apply(trackerAlways, ['remove'].concat(args));
                  });
                  tracker.on('end', function () {
                    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                      args[_key5] = arguments[_key5];
                    }

                    return trackerAlways.emit.apply(trackerAlways, ['end'].concat(args));
                  });
                  tracker.on('error', function () {
                    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                      args[_key6] = arguments[_key6];
                    }

                    return trackerAlways.emit.apply(trackerAlways, ['error'].concat(args));
                  });
                }).catch(function (e) {
                  return _bluebird2.default.delay(5000).then(trackerRepeater);
                });
              };

              networkRepeater = function networkRepeater() {
                var networks = _lodash2.default.reduce(_os2.default.networkInterfaces(), function (o, networks) {
                  var network = _lodash2.default.find(networks, { family: 'IPv4', internal: false });
                  return network ? o.concat([network.address + '/24']) : o;
                }, []);
                return _bluebird2.default.map(networks, function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(subnet) {
                    var devices;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return NetScannerPromise({ target: subnet, port: '5555', status: 'O' });

                          case 2:
                            devices = _context.sent;
                            return _context.abrupt('return', _bluebird2.default.map(devices, function (device) {
                              if (device.status == 'open') return _this.connect(device.ip, device.port).catch(function () {});
                            }));

                          case 4:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function (_x) {
                    return _ref2.apply(this, arguments);
                  };
                }()).finally(function (e) {
                  return _bluebird2.default.delay(5000).then(networkRepeater);
                });
              };

              setTimeout(function () {
                return trackerRepeater();
              });
              setTimeout(function () {
                return _bluebird2.default.map(_this.listDevices(), function (device) {
                  return trackerAlways.emit('add', device);
                }).then(function () {
                  return networkRepeater();
                });
              }, 1000);
              return _context2.abrupt('return', trackerAlways);

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this);
    }))).nodeify(callback);
  };
}