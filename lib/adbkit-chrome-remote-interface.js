'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _chromeRemoteInterface = require('chrome-remote-interface');

var _chromeRemoteInterface2 = _interopRequireDefault(_chromeRemoteInterface);

var _client = require('adbkit/lib/adb/client');

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CHROME_PACKAGES = 'com.android.chrome';
var CHROME_ACTIVITY = 'com.google.android.apps.chrome.Main';
var CHROME_PROTOCOL = 'localabstract:chrome_devtools_remote';

var ChromeRemoteInterface = function () {
  function ChromeRemoteInterface() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var serial = arguments[1];
    var adb = arguments[2];

    _classCallCheck(this, ChromeRemoteInterface);

    this.defs = {
      host: '127.0.0.1',
      port: 9222,
      secure: false,
      local: true, /* Chrome 62... has Bug! */
      chrome: {
        reset: true,
        args: [],
        onReset: function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    console.info(serial, 'chrome_reset');

                  case 1:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          function onReset() {
            return _ref.apply(this, arguments);
          }

          return onReset;
        }(),
        onPreload: function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    console.info(serial, 'chrome_preload');

                  case 1:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));

          function onPreload() {
            return _ref2.apply(this, arguments);
          }

          return onPreload;
        }(),
        onLoad: function () {
          var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    console.info(serial, 'chrome_load');

                  case 1:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));

          function onLoad() {
            return _ref3.apply(this, arguments);
          }

          return onLoad;
        }(),
        onConnect: function () {
          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    console.info(serial, 'chrome_connect');

                  case 1:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          }));

          function onConnect() {
            return _ref4.apply(this, arguments);
          }

          return onConnect;
        }(),
        onDisconnect: function () {
          var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    console.info(serial, 'chrome_disconnect');

                  case 1:
                  case 'end':
                    return _context5.stop();
                }
              }
            }, _callee5, this);
          }));

          function onDisconnect() {
            return _ref5.apply(this, arguments);
          }

          return onDisconnect;
        }()
      }
    };
    this.opts = _lodash2.default.defaultsDeep(options, this.defs);
    this.serial = serial;
    this.adb = adb;
  }

  _createClass(ChromeRemoteInterface, [{
    key: 'Connect',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var opts, has_chrome_android, chromeCommandLine;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                opts = _lodash2.default.assign(options, this.opts);

                if (!(this.adb instanceof _client2.default)) {
                  _context6.next = 36;
                  break;
                }

                _context6.next = 4;
                return this.adb.isInstalled(this.serial, CHROME_PACKAGES);

              case 4:
                has_chrome_android = _context6.sent;

                if (has_chrome_android) {
                  _context6.next = 7;
                  break;
                }

                throw new Error('chrome not found!');

              case 7:
                _context6.next = 9;
                return this.adb.forward(this.serial, 'tcp:' + opts.port, CHROME_PROTOCOL).delay(1000);

              case 9:
                // chrome run
                chromeCommandLine = [];

                chromeCommandLine.push('--disable-fre');
                chromeCommandLine.push('--no-default-browser-check');
                chromeCommandLine.push('--no-first-run');
                chromeCommandLine.push('--ignore-certificate-errors');
                chromeCommandLine.push.apply(chromeCommandLine, opts.chrome.args);
                _context6.next = 17;
                return this.adb.shellWait(this.serial, 'am force-stop ' + CHROME_PACKAGES);

              case 17:
                if (!opts.chrome.reset) {
                  _context6.next = 22;
                  break;
                }

                _context6.next = 20;
                return this.adb.shellWait(this.serial, 'pm clear ' + CHROME_PACKAGES);

              case 20:
                _context6.next = 22;
                return opts.chrome.onReset();

              case 22:
                _context6.next = 24;
                return opts.chrome.onPreload();

              case 24:
                _context6.next = 26;
                return this.adb.shellWait(this.serial, 'echo "chrome ' + chromeCommandLine.join(' ') + '" > /data/local/tmp/chrome-command-line');

              case 26:
                _context6.next = 28;
                return this.adb.shellWait(this.serial, 'am set-debug-app --persistent ' + CHROME_PACKAGES);

              case 28:
                _context6.next = 30;
                return this.adb.shellWait(this.serial, 'am start -n ' + CHROME_PACKAGES + '/' + CHROME_ACTIVITY + ' -d \'data:,\'');

              case 30:
                _context6.next = 32;
                return _bluebird2.default.delay(5000);

              case 32:
                _context6.next = 34;
                return opts.chrome.onLoad();

              case 34:
                _context6.next = 36;
                break;

              case 36:
                _context6.next = 38;
                return (0, _chromeRemoteInterface2.default)(opts);

              case 38:
                this.client = _context6.sent;

                /* CALLBACK */this.client.once('ready', opts.chrome.onConnect);
                /* CALLBACK */this.client.once('disconnect', opts.chrome.onDisconnect);
                return _context6.abrupt('return', this);

              case 42:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function Connect() {
        return _ref6.apply(this, arguments);
      }

      return Connect;
    }()
  }, {
    key: 'Protocol',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt('return', _chromeRemoteInterface2.default.Protocol(_lodash2.default.assign({}, options, this.opts)));

              case 1:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function Protocol() {
        return _ref7.apply(this, arguments);
      }

      return Protocol;
    }()
  }, {
    key: 'List',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                return _context8.abrupt('return', _chromeRemoteInterface2.default.List(_lodash2.default.assign({}, options, this.opts)));

              case 1:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function List() {
        return _ref8.apply(this, arguments);
      }

      return List;
    }()
  }, {
    key: 'New',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                return _context9.abrupt('return', _chromeRemoteInterface2.default.New(_lodash2.default.assign({}, options, this.opts)));

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function New() {
        return _ref9.apply(this, arguments);
      }

      return New;
    }()
  }, {
    key: 'Activate',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                return _context10.abrupt('return', _chromeRemoteInterface2.default.Activate(_lodash2.default.assign({}, options, this.opts)));

              case 1:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function Activate() {
        return _ref10.apply(this, arguments);
      }

      return Activate;
    }()
  }, {
    key: 'Close',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                return _context11.abrupt('return', _chromeRemoteInterface2.default.Close(_lodash2.default.assign({}, options, this.opts)));

              case 1:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function Close() {
        return _ref11.apply(this, arguments);
      }

      return Close;
    }()
  }, {
    key: 'Version',
    value: function () {
      var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt('return', _chromeRemoteInterface2.default.Version(_lodash2.default.assign({}, options, this.opts)));

              case 1:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function Version() {
        return _ref12.apply(this, arguments);
      }

      return Version;
    }()
  }, {
    key: 'on',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(eventName, callback) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                this.client.on(eventName, callback);
                return _context13.abrupt('return', this);

              case 2:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function on(_x9, _x10) {
        return _ref13.apply(this, arguments);
      }

      return on;
    }()
  }, {
    key: 'once',
    value: function () {
      var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(eventName, callback) {
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                this.client.once(eventName, callback);
                return _context14.abrupt('return', this);

              case 2:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function once(_x11, _x12) {
        return _ref14.apply(this, arguments);
      }

      return once;
    }()
  }, {
    key: 'send',
    value: function () {
      var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(method, params) {
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                return _context15.abrupt('return', this.client.send(method, params));

              case 1:
              case 'end':
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      function send(_x13, _x14) {
        return _ref15.apply(this, arguments);
      }

      return send;
    }()
  }, {
    key: 'close',
    value: function () {
      var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                return _context16.abrupt('return', this.client.close());

              case 1:
              case 'end':
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));

      function close() {
        return _ref16.apply(this, arguments);
      }

      return close;
    }()
  }, {
    key: 'Accessibility',
    get: function get() {
      return this.client.Accessibility;
    }
  }, {
    key: 'Animation',
    get: function get() {
      return this.client.Animation;
    }
  }, {
    key: 'ApplicationCache',
    get: function get() {
      return this.client.ApplicationCache;
    }
  }, {
    key: 'Audits',
    get: function get() {
      return this.client.Audits;
    }
  }, {
    key: 'Browser',
    get: function get() {
      return this.client.Browser;
    }
  }, {
    key: 'CSS',
    get: function get() {
      return this.client.CSS;
    }
  }, {
    key: 'CacheStorage',
    get: function get() {
      return this.client.CacheStorage;
    }
  }, {
    key: 'DOM',
    get: function get() {
      return this.client.DOM;
    }
  }, {
    key: 'DOMDebugger',
    get: function get() {
      return this.client.DOMDebugger;
    }
  }, {
    key: 'DOMSnapshot',
    get: function get() {
      return this.client.DOMSnapshot;
    }
  }, {
    key: 'DOMStorage',
    get: function get() {
      return this.client.DOMStorage;
    }
  }, {
    key: 'Database',
    get: function get() {
      return this.client.Database;
    }
  }, {
    key: 'DeviceOrientation',
    get: function get() {
      return this.client.DeviceOrientation;
    }
  }, {
    key: 'Emulation',
    get: function get() {
      return this.client.Emulation;
    }
  }, {
    key: 'HeadlessExperimental',
    get: function get() {
      return this.client.HeadlessExperimental;
    }
  }, {
    key: 'IO',
    get: function get() {
      return this.client.IO;
    }
  }, {
    key: 'IndexedDB',
    get: function get() {
      return this.client.IndexedDB;
    }
  }, {
    key: 'Input',
    get: function get() {
      return this.client.Input;
    }
  }, {
    key: 'Inspector',
    get: function get() {
      return this.client.Inspector;
    }
  }, {
    key: 'LayerTree',
    get: function get() {
      return this.client.LayerTree;
    }
  }, {
    key: 'Log',
    get: function get() {
      return this.client.Log;
    }
  }, {
    key: 'Memory',
    get: function get() {
      return this.client.Memory;
    }
  }, {
    key: 'Network',
    get: function get() {
      return this.client.Network;
    }
  }, {
    key: 'Overlay',
    get: function get() {
      return this.client.Overlay;
    }
  }, {
    key: 'Page',
    get: function get() {
      return this.client.Page;
    }
  }, {
    key: 'Performance',
    get: function get() {
      return this.client.Performance;
    }
  }, {
    key: 'Security',
    get: function get() {
      return this.client.Security;
    }
  }, {
    key: 'ServiceWorker',
    get: function get() {
      return this.client.ServiceWorker;
    }
  }, {
    key: 'Storage',
    get: function get() {
      return this.client.Storage;
    }
  }, {
    key: 'SystemInfo',
    get: function get() {
      return this.client.SystemInfo;
    }
  }, {
    key: 'Target',
    get: function get() {
      return this.client.Target;
    }
  }, {
    key: 'Tethering',
    get: function get() {
      return this.client.Tethering;
    }
  }, {
    key: 'Tracing',
    get: function get() {
      return this.client.Tracing;
    }
  }, {
    key: 'Console',
    get: function get() {
      return this.client.Console;
    }
  }, {
    key: 'Debugger',
    get: function get() {
      return this.client.Debugger;
    }
  }, {
    key: 'HeapProfiler',
    get: function get() {
      return this.client.HeapProfiler;
    }
  }, {
    key: 'Profiler',
    get: function get() {
      return this.client.Profiler;
    }
  }, {
    key: 'Runtime',
    get: function get() {
      return this.client.Runtime;
    }
  }, {
    key: 'Schema',
    get: function get() {
      return this.client.Schema;
    }
  }]);

  return ChromeRemoteInterface;
}();

_client2.default.prototype.chrome = function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(serial) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            return _context17.abrupt('return', new ChromeRemoteInterface(options, serial, this).Connect());

          case 1:
          case 'end':
            return _context17.stop();
        }
      }
    }, _callee17, this);
  }));

  return function (_x16) {
    return _ref17.apply(this, arguments);
  };
}();