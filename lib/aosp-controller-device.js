'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ControllerDeviceChrome = undefined;

var ControllerDeviceChrome = exports.ControllerDeviceChrome = function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(adb, serial, rooted) {
    var port, timestamp, cacheList, caches, cache, crowner;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            _context23.t0 = parseInt;
            _context23.t2 = _lodash2.default;
            _context23.t3 = _lodash2.default;
            _context23.next = 5;
            return adb.listForwards(serial);

          case 5:
            _context23.t4 = _context23.sent;
            _context23.t5 = { remote: 'localabstract:chrome_devtools_remote' };
            _context23.t6 = _context23.t3.find.call(_context23.t3, _context23.t4, _context23.t5);
            _context23.t1 = _context23.t2.get.call(_context23.t2, _context23.t6, 'local', "").replace(/[^\d]/g, '');

            if (_context23.t1) {
              _context23.next = 11;
              break;
            }

            _context23.t1 = _lodash2.default.random(9223, 9323);

          case 11:
            _context23.t7 = _context23.t1;
            port = (0, _context23.t0)(_context23.t7);

            if (!rooted) {
              _context23.next = 39;
              break;
            }

            timestamp = (0, _moment2.default)().add(10, 'm');
            _context23.next = 17;
            return adb.shellWait(serial, 'su -c \'killall crond\' root');

          case 17:
            _context23.next = 19;
            return adb.shellWait(serial, 'su -c \'mkdir -p /sdcard/android/crontabs\' root');

          case 19:
            _context23.next = 21;
            return adb.shellWait(serial, 'su -c \'echo "' + timestamp.minutes() + ' * * * * reboot" > /sdcard/android/crontabs/root\' root');

          case 21:
            _context23.next = 23;
            return adb.shellWait(serial, 'su -c \'crond -b -c /sdcard/android/crontabs\' root');

          case 23:
            _context23.next = 25;
            return adb.shellWait(serial, 'ls -1c ' + CHROME_CACHE_BASE);

          case 25:
            cacheList = _context23.sent;
            caches = cacheList.toString().trim().split('\n').map(_lodash2.default.toNumber);
            cache = _lodash2.default.sample(caches.length >= CHROME_CACHE_SIZE ? caches : _lodash2.default.xor(caches, _lodash2.default.range(1, 9999)));
            _context23.next = 30;
            return adb.shellWait(serial, 'su -c "F=($(ls -ld /data/data/com.android.chrome/)) && echo ${F[2]}" root');

          case 30:
            _context23.t8 = _context23.sent.toString().trim();

            if (_context23.t8) {
              _context23.next = 33;
              break;
            }

            _context23.t8 = 'root';

          case 33:
            crowner = _context23.t8;


            _logger2.default.info('Loop Controller Chrome by ' + serial);
            _logger2.default.info('- MAX: ' + CHROME_CACHE_SIZE + ', CUR: ' + caches.length + ', NOW: ' + cache + ', USR: ' + crowner);
            return _context23.abrupt('return', adb.chrome(serial, {
              port: port,
              chrome: {
                reset: false,
                onPreload: function () {
                  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
                    return regeneratorRuntime.wrap(function _callee22$(_context22) {
                      while (1) {
                        switch (_context22.prev = _context22.next) {
                          case 0:
                            _context22.next = 2;
                            return adb.shellWait(serial, 'su -c \'mkdir -p ' + CHROME_CACHE_BASE + cache + '\' root');

                          case 2:
                            _context22.next = 4;
                            return adb.shellWait(serial, 'su -c \'chmod 777 ' + CHROME_CACHE_BASE + cache + '\' root');

                          case 4:
                            _context22.next = 6;
                            return adb.shellWait(serial, 'su -c \'rm -rf ' + CHROME_CACHE_TABS + '\' root');

                          case 6:
                            _context22.next = 8;
                            return adb.shellWait(serial, 'su -c \'[ -d ' + CHROME_CACHE_APPS + ' ] && rm -rf ' + CHROME_CACHE_APPS + '\' ' + crowner);

                          case 8:
                            _context22.next = 10;
                            return adb.shellWait(serial, 'su -c \'[ -L ' + CHROME_CACHE_APPS + ' ] && rm -f ' + CHROME_CACHE_APPS + '\' ' + crowner);

                          case 10:
                            _context22.next = 12;
                            return adb.shellWait(serial, 'su -c \'ln -s ' + CHROME_CACHE_BASE + cache + ' ' + CHROME_CACHE_APPS + '\' ' + crowner);

                          case 12:
                          case 'end':
                            return _context22.stop();
                        }
                      }
                    }, _callee22, this);
                  }));

                  function onPreload() {
                    return _ref24.apply(this, arguments);
                  }

                  return onPreload;
                }()
              }
            }));

          case 39:
            return _context23.abrupt('return', adb.chrome(serial, { port: port }));

          case 40:
          case 'end':
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function ControllerDeviceChrome(_x24, _x25, _x26) {
    return _ref23.apply(this, arguments);
  };
}();

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _devices = require('../devices');

var DEVICE_INFOS = _interopRequireWildcard(_devices);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _easing = require('easing');

var _easing2 = _interopRequireDefault(_easing);

var _hangulJs = require('hangul-js');

var _hangulJs2 = _interopRequireDefault(_hangulJs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var CHROME_CACHE_SIZE = 600;
var CHROME_CACHE_BASE = '/data/local/chrome-cache/';
var CHROME_CACHE_APPS = '/data/data/com.android.chrome/app_chrome';
var CHROME_CACHE_TABS = '/data/data/com.android.chrome/app_tabs';

var KEYWORDS_TARGET = require('../target.json');
var KEYWORDS_INTEREST = require('../interest.json');

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(adb, serial, rooted) {
    var _this = this;

    var chrome, Runtime, Network, Page, Emulation, DOM, Input, chromeDeviceEmulation, chromeDeviceEmulationSwipe, chromeDeviceEmulationTouch, chromeDeviceEmulationTouchElement, chromeDeviceEmulationInput, chromeDeviceEmulationGoBack, keywords, ks;
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _logger2.default.info('Loop Controller Device by ' + serial);
            _context21.next = 3;
            return ControllerDeviceChrome(adb, serial, rooted);

          case 3:
            chrome = _context21.sent;
            Runtime = chrome.Runtime, Network = chrome.Network, Page = chrome.Page, Emulation = chrome.Emulation, DOM = chrome.DOM, Input = chrome.Input;

            chromeDeviceEmulation = function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var modelName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'SM-G935K';
                var model, isMobile, overrides;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        model = _lodash2.default.get(DEVICE_INFOS, 'SM-G935K', DEVICE_INFOS.COMMON || {});
                        isMobile = (model['window.navigator.platform'] || "").indexOf('arm') !== -1;
                        _context2.next = 4;
                        return (Network.setUserAgentOverride || Emulation.setUserAgentOverride)({
                          userAgent: model['window.navigator.userAgent'],
                          acceptLanguage: model['window.navigator.language'],
                          platform: model['window.navigator.platform']
                        });

                      case 4:
                        _context2.next = 6;
                        return Emulation.setDeviceMetricsOverride({
                          width: model['window.outerWidth'],
                          height: model['window.outerHeight'],
                          mobile: isMobile,
                          deviceScaleFactor: model['window.devicePixelRatio'],
                          screenWidth: model['window.screen.width'],
                          screenHeight: model['window.screen.height']
                        });

                      case 6:
                        _context2.next = 8;
                        return Emulation.setTouchEmulationEnabled({
                          enabled: isMobile,
                          maxTouchPoints: model['window.navigator.maxTouchPoints']
                        });

                      case 8:
                        overrides = _lodash2.default.map(model, function (value, path) {
                          var attrName = _lodash2.default.join(_lodash2.default.dropRight(path.split('.')), '.');
                          var attrType = _lodash2.default.nth(path.split('.'), -1);
                          var attrValue = _lodash2.default.isString(value) ? '"' + value + '"' : value;
                          return attrName + '.__defineGetter__("' + attrType + '", function() { return ' + attrValue + '; });';
                        });

                        overrides.push('delete navigator.__proto__.webdriver;');
                        overrides.push('\n      if(!window.Bluetooth){\n        window.Bluetooth = class Bluetooth {\n          get [Symbol.toStringTag]() { return "Bluetooth"; }\n        } \n      }\n    ');
                        overrides.push('window.navigator.__defineGetter__("bluetooth", function () { return new Bluetooth(); })');
                        overrides.push('\n      if(!window.MediaSession){\n        window.MediaSession = class MediaSession {\n          constructor(metadata, playbackState) {\n            this.metadata = metadata;\n            this.playbackState = playbackState;\n          }\n        };\n      }\n    ');
                        overrides.push('window.navigator.__defineGetter__("mediaSession", function () { return new MediaSession(null, "none"); }');
                        overrides.push('\n      if(window.UNMASKED_RENDERER_WEBGL && window.UNMASKED_VENDOR_WEBGL) {\n        WebGLRenderingContext.prototype.getParameter = (function(o) {\n          return function(param){\n            var info = this.getExtension("WEBGL_debug_renderer_info");\n            if(param === info.UNMASKED_RENDERER_WEBGL) return window.UNMASKED_RENDERER_WEBGL;\n            if(param === info.UNMASKED_VENDOR_WEBGL)   return window.UNMASKED_VENDOR_WEBGL;\n            return o.apply(this, [param]);\n          }\n        })(WebGLRenderingContext.prototype.getParameter);\n      }\n    ');
                        _context2.next = 17;
                        return Page.addScriptToEvaluateOnNewDocument({ source: overrides.join(';\n') });

                      case 17:
                        _context2.next = 19;
                        return Page.javascriptDialogOpening(function () {
                          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref3) {
                            var message = _ref3.message,
                                type = _ref3.type;
                            return regeneratorRuntime.wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    _context.prev = 0;
                                    _context.next = 3;
                                    return Page.handleJavaScriptDialog({ accept: true });

                                  case 3:
                                    _logger2.default.info(serial + ' > ' + type + ': ' + message + ' -> accepted!');
                                    _context.next = 9;
                                    break;

                                  case 6:
                                    _context.prev = 6;
                                    _context.t0 = _context['catch'](0);

                                    _logger2.default.error(_context.t0);

                                  case 9:
                                  case 'end':
                                    return _context.stop();
                                }
                              }
                            }, _callee, _this, [[0, 6]]);
                          }));

                          return function (_x5) {
                            return _ref4.apply(this, arguments);
                          };
                        }());

                      case 19:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this);
              }));

              return function chromeDeviceEmulation() {
                return _ref2.apply(this, arguments);
              };
            }();

            chromeDeviceEmulationSwipe = function () {
              var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var metrics, cx, cy, mx, my;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.next = 2;
                        return Page.getLayoutMetrics();

                      case 2:
                        metrics = _context7.sent;
                        cx = metrics.layoutViewport.clientWidth / 2;
                        cy = metrics.layoutViewport.clientHeight / 2;
                        mx = cx / 4;
                        my = cy / 4;
                        _context7.t0 = options.direction.toLowerCase();
                        _context7.next = _context7.t0 === 'u' ? 10 : _context7.t0 === 'up' ? 10 : _context7.t0 === 'd' ? 17 : _context7.t0 === 'down' ? 17 : _context7.t0 === 'r' ? 24 : _context7.t0 === 'right' ? 24 : _context7.t0 === 'l' ? 31 : _context7.t0 === 'left' ? 31 : 38;
                        break;

                      case 10:
                        _context7.next = 12;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 12:
                        _context7.next = 14;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ratio) {
                            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                              while (1) {
                                switch (_context3.prev = _context3.next) {
                                  case 0:
                                    _context3.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx, y: cy + my * ratio }] });

                                  case 2:
                                    _context3.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context3.stop();
                                }
                              }
                            }, _callee3, _this);
                          }));

                          return function (_x7) {
                            return _ref6.apply(this, arguments);
                          };
                        }());

                      case 14:
                        _context7.next = 16;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 16:
                        return _context7.abrupt('break', 38);

                      case 17:
                        _context7.next = 19;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 19:
                        _context7.next = 21;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(ratio) {
                            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                              while (1) {
                                switch (_context4.prev = _context4.next) {
                                  case 0:
                                    _context4.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx, y: cy - my * ratio }] });

                                  case 2:
                                    _context4.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context4.stop();
                                }
                              }
                            }, _callee4, _this);
                          }));

                          return function (_x8) {
                            return _ref7.apply(this, arguments);
                          };
                        }());

                      case 21:
                        _context7.next = 23;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 23:
                        return _context7.abrupt('break', 38);

                      case 24:
                        _context7.next = 26;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 26:
                        _context7.next = 28;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(ratio) {
                            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                              while (1) {
                                switch (_context5.prev = _context5.next) {
                                  case 0:
                                    _context5.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx + mx * ratio, y: cy }] });

                                  case 2:
                                    _context5.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context5.stop();
                                }
                              }
                            }, _callee5, _this);
                          }));

                          return function (_x9) {
                            return _ref8.apply(this, arguments);
                          };
                        }());

                      case 28:
                        _context7.next = 30;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 30:
                        return _context7.abrupt('break', 38);

                      case 31:
                        _context7.next = 33;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 33:
                        _context7.next = 35;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(ratio) {
                            return regeneratorRuntime.wrap(function _callee6$(_context6) {
                              while (1) {
                                switch (_context6.prev = _context6.next) {
                                  case 0:
                                    _context6.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx - mx * ratio, y: cy }] });

                                  case 2:
                                    _context6.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context6.stop();
                                }
                              }
                            }, _callee6, _this);
                          }));

                          return function (_x10) {
                            return _ref9.apply(this, arguments);
                          };
                        }());

                      case 35:
                        _context7.next = 37;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 37:
                        return _context7.abrupt('break', 38);

                      case 38:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, _this);
              }));

              return function chromeDeviceEmulationSwipe() {
                return _ref5.apply(this, arguments);
              };
            }();

            chromeDeviceEmulationTouch = function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(selector) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var document, elements;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.prev = 0;
                        _context8.next = 3;
                        return DOM.getDocument();

                      case 3:
                        document = _context8.sent;
                        _context8.next = 6;
                        return DOM.querySelectorAll({ nodeId: document.root.nodeId, selector: selector });

                      case 6:
                        elements = _context8.sent;
                        return _context8.abrupt('return', chromeDeviceEmulationTouchElement({ nodeId: options.random ? _lodash2.default.sample(elements.nodeIds) : _lodash2.default.nth(elements.nodeIds, 0) }, options));

                      case 10:
                        _context8.prev = 10;
                        _context8.t0 = _context8['catch'](0);

                        if (!options.random) {
                          _context8.next = 14;
                          break;
                        }

                        return _context8.abrupt('return', chromeDeviceEmulationTouch(selector, options));

                      case 14:
                        throw _context8.t0;

                      case 15:
                      case 'end':
                        return _context8.stop();
                    }
                  }
                }, _callee8, _this, [[0, 10]]);
              }));

              return function chromeDeviceEmulationTouch(_x12) {
                return _ref10.apply(this, arguments);
              };
            }();

            chromeDeviceEmulationTouchElement = function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(element) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var metrics, elementBox, elementRect, bounding, cx, cy, mx, my, boundingT, boundingL, boundingB, boundingR, dx, dy;
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        _context13.next = 2;
                        return Page.getLayoutMetrics();

                      case 2:
                        metrics = _context13.sent;
                        _context13.next = 5;
                        return DOM.getBoxModel(element);

                      case 5:
                        elementBox = _context13.sent;
                        elementRect = _lodash2.default.zipObject(['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4'], _lodash2.default.get(elementBox, 'model.content'));
                        bounding = {
                          left: Math.min(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4) + 5,
                          right: Math.max(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4) - 5,
                          top: Math.min(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4) + 5,
                          bottom: Math.max(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4) - 5
                        };
                        cx = metrics.layoutViewport.clientWidth / 2;
                        cy = metrics.layoutViewport.clientHeight / 2;
                        mx = cx / 4;
                        my = cy / 4;
                        boundingT = bounding.top >= 0;
                        boundingL = bounding.left >= 0;
                        boundingB = bounding.bottom <= metrics.layoutViewport.clientHeight;
                        boundingR = bounding.right <= metrics.layoutViewport.clientWidth;
                        _context13.t0 = true;
                        _context13.next = _context13.t0 === !boundingT ? 19 : _context13.t0 === !boundingB ? 28 : _context13.t0 === !boundingL ? 37 : _context13.t0 === !boundingR ? 46 : 55;
                        break;

                      case 19:
                        _context13.next = 21;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 21:
                        _context13.next = 23;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(ratio) {
                            return regeneratorRuntime.wrap(function _callee9$(_context9) {
                              while (1) {
                                switch (_context9.prev = _context9.next) {
                                  case 0:
                                    _context9.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx, y: cy + my * ratio }] });

                                  case 2:
                                    _context9.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context9.stop();
                                }
                              }
                            }, _callee9, _this);
                          }));

                          return function (_x15) {
                            return _ref12.apply(this, arguments);
                          };
                        }());

                      case 23:
                        _context13.next = 25;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 25:
                        _context13.next = 27;
                        return chromeDeviceEmulationTouchElement(element, options);

                      case 27:
                        return _context13.abrupt('break', 65);

                      case 28:
                        _context13.next = 30;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 30:
                        _context13.next = 32;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(ratio) {
                            return regeneratorRuntime.wrap(function _callee10$(_context10) {
                              while (1) {
                                switch (_context10.prev = _context10.next) {
                                  case 0:
                                    _context10.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx, y: cy - my * ratio }] });

                                  case 2:
                                    _context10.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context10.stop();
                                }
                              }
                            }, _callee10, _this);
                          }));

                          return function (_x16) {
                            return _ref13.apply(this, arguments);
                          };
                        }());

                      case 32:
                        _context13.next = 34;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 34:
                        _context13.next = 36;
                        return chromeDeviceEmulationTouchElement(element, options);

                      case 36:
                        return _context13.abrupt('break', 65);

                      case 37:
                        _context13.next = 39;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 39:
                        _context13.next = 41;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(ratio) {
                            return regeneratorRuntime.wrap(function _callee11$(_context11) {
                              while (1) {
                                switch (_context11.prev = _context11.next) {
                                  case 0:
                                    _context11.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx + mx * ratio, y: cy }] });

                                  case 2:
                                    _context11.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context11.stop();
                                }
                              }
                            }, _callee11, _this);
                          }));

                          return function (_x17) {
                            return _ref14.apply(this, arguments);
                          };
                        }());

                      case 41:
                        _context13.next = 43;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 43:
                        _context13.next = 45;
                        return chromeDeviceEmulationTouchElement(element, options);

                      case 45:
                        return _context13.abrupt('break', 65);

                      case 46:
                        _context13.next = 48;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });

                      case 48:
                        _context13.next = 50;
                        return _bluebird2.default.mapSeries((0, _easing2.default)(_lodash2.default.random(5, 10), 'linear'), function () {
                          var _ref15 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(ratio) {
                            return regeneratorRuntime.wrap(function _callee12$(_context12) {
                              while (1) {
                                switch (_context12.prev = _context12.next) {
                                  case 0:
                                    _context12.next = 2;
                                    return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: cx - mx * ratio, y: cy }] });

                                  case 2:
                                    _context12.next = 4;
                                    return _bluebird2.default.delay(_lodash2.default.random(100, 150));

                                  case 4:
                                  case 'end':
                                    return _context12.stop();
                                }
                              }
                            }, _callee12, _this);
                          }));

                          return function (_x18) {
                            return _ref15.apply(this, arguments);
                          };
                        }());

                      case 50:
                        _context13.next = 52;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 52:
                        _context13.next = 54;
                        return chromeDeviceEmulationTouchElement(element, options);

                      case 54:
                        return _context13.abrupt('break', 65);

                      case 55:
                        dx = _lodash2.default.get(options, 'x', _lodash2.default.random(bounding.left, bounding.right));
                        dy = _lodash2.default.get(options, 'y', _lodash2.default.random(bounding.top, bounding.bottom));
                        _context13.next = 59;
                        return Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: dx, y: dy }] });

                      case 59:
                        _context13.next = 61;
                        return Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{ x: dx, y: dy }] });

                      case 61:
                        _context13.next = 63;
                        return Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });

                      case 63:
                        _context13.next = 65;
                        return _bluebird2.default.delay(1000);

                      case 65:
                      case 'end':
                        return _context13.stop();
                    }
                  }
                }, _callee13, _this);
              }));

              return function chromeDeviceEmulationTouchElement(_x14) {
                return _ref11.apply(this, arguments);
              };
            }();

            chromeDeviceEmulationInput = function () {
              var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(selector) {
                var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                var isComposing, chars;
                return regeneratorRuntime.wrap(function _callee18$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        isComposing = false;
                        chars = _hangulJs2.default.d(_lodash2.default.get(options, 'text', ''));
                        _context18.next = 4;
                        return chromeDeviceEmulationTouch(selector, options);

                      case 4:
                        _context18.next = 6;
                        return _bluebird2.default.mapSeries(chars, function () {
                          var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(char, offset) {
                            var input, inputLast, charCode, isKorean;
                            return regeneratorRuntime.wrap(function _callee17$(_context17) {
                              while (1) {
                                switch (_context17.prev = _context17.next) {
                                  case 0:
                                    input = _hangulJs2.default.a(chars.slice(0, offset + 1));
                                    inputLast = input.substr(-1);
                                    charCode = inputLast.charCodeAt(0);
                                    isKorean = false || 0x1100 <= charCode && charCode <= 0x1112 || 0x1161 <= charCode && charCode <= 0x1175 || 0x11A8 <= charCode && charCode <= 0x11C2 || 0xAC00 <= charCode && charCode <= 0xD7A3;
                                    return _context17.abrupt('return', _bluebird2.default.resolve()
                                    // KeyDown
                                    .then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                                      return regeneratorRuntime.wrap(function _callee14$(_context14) {
                                        while (1) {
                                          switch (_context14.prev = _context14.next) {
                                            case 0:
                                              if (!isKorean) {
                                                _context14.next = 11;
                                                break;
                                              }

                                              _context14.next = 3;
                                              return Page.bringToFront();

                                            case 3:
                                              _context14.next = 5;
                                              return Input.dispatchKeyEvent({ type: 'rawKeyDown', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });

                                            case 5:
                                              _context14.next = 7;
                                              return Page.bringToFront();

                                            case 7:
                                              _context14.next = 9;
                                              return Input.dispatchKeyEvent({ type: 'keyDown', code: '', key: 'Unidentified', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });

                                            case 9:
                                              _context14.next = 19;
                                              break;

                                            case 11:
                                              _context14.next = 13;
                                              return Page.bringToFront();

                                            case 13:
                                              _context14.next = 15;
                                              return Input.dispatchKeyEvent({ type: 'rawKeyDown', windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });

                                            case 15:
                                              _context14.next = 17;
                                              return Page.bringToFront();

                                            case 17:
                                              _context14.next = 19;
                                              return Input.dispatchKeyEvent({ type: 'keyDown', windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });

                                            case 19:
                                            case 'end':
                                              return _context14.stop();
                                          }
                                        }
                                      }, _callee14, _this);
                                    }))).delay(_lodash2.default.random(30, 70))
                                    // Composition
                                    .then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                                      return regeneratorRuntime.wrap(function _callee15$(_context15) {
                                        while (1) {
                                          switch (_context15.prev = _context15.next) {
                                            case 0:
                                              if (!isKorean) {
                                                _context15.next = 17;
                                                break;
                                              }

                                              if (isComposing) {
                                                _context15.next = 4;
                                                break;
                                              }

                                              _context15.next = 4;
                                              return Runtime.evaluate({ userGesture: false, expression: 'document.activeElement.dispatchEvent(new CompositionEvent(\'compositionstart\', { data: \'\' }));' });

                                            case 4:
                                              isComposing = true;
                                              _context15.next = 7;
                                              return Runtime.evaluate({ userGesture: false, expression: 'document.activeElement.dispatchEvent(new CompositionEvent(\'compositionupdate\', { data: \'' + inputLast + '\' }));' });

                                            case 7:
                                              _context15.next = 9;
                                              return Runtime.evaluate({ userGesture: false, expression: 'document.activeElement.value = \'' + input.substring(0, input.length - 1) + '\'' });

                                            case 9:
                                              _context15.next = 11;
                                              return Page.bringToFront();

                                            case 11:
                                              _context15.next = 13;
                                              return Input.dispatchKeyEvent({ type: 'char', text: inputLast, windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });

                                            case 13:
                                              _context15.next = 15;
                                              return _bluebird2.default.delay(100);

                                            case 15:
                                              _context15.next = 27;
                                              break;

                                            case 17:
                                              if (!isComposing) {
                                                _context15.next = 20;
                                                break;
                                              }

                                              _context15.next = 20;
                                              return Runtime.evaluate({ userGesture: false, expression: 'document.activeElement.dispatchEvent(new CompositionEvent(\'compositionend\', { data: \'' + inputLast + '\' }));' });

                                            case 20:
                                              isComposing = false;
                                              _context15.next = 23;
                                              return Runtime.evaluate({ userGesture: false, expression: 'document.activeElement.value = \'' + input.substring(0, input.length - 1) + '\'' });

                                            case 23:
                                              _context15.next = 25;
                                              return Page.bringToFront();

                                            case 25:
                                              _context15.next = 27;
                                              return Input.dispatchKeyEvent({ type: 'char', text: char, windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });

                                            case 27:
                                            case 'end':
                                              return _context15.stop();
                                          }
                                        }
                                      }, _callee15, _this);
                                    }))).delay(_lodash2.default.random(30, 70))
                                    // KeyUp
                                    .then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                                      return regeneratorRuntime.wrap(function _callee16$(_context16) {
                                        while (1) {
                                          switch (_context16.prev = _context16.next) {
                                            case 0:
                                              if (!isKorean) {
                                                _context16.next = 7;
                                                break;
                                              }

                                              _context16.next = 3;
                                              return Page.bringToFront();

                                            case 3:
                                              _context16.next = 5;
                                              return Input.dispatchKeyEvent({ type: 'keyUp', code: '', key: 'Unidentified', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });

                                            case 5:
                                              _context16.next = 11;
                                              break;

                                            case 7:
                                              _context16.next = 9;
                                              return Page.bringToFront();

                                            case 9:
                                              _context16.next = 11;
                                              return Input.dispatchKeyEvent({ type: 'keyUp', windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });

                                            case 11:
                                            case 'end':
                                              return _context16.stop();
                                          }
                                        }
                                      }, _callee16, _this);
                                    }))).delay(_lodash2.default.random(70, 100)).then(function () {
                                      return Page.bringToFront();
                                    }));

                                  case 5:
                                  case 'end':
                                    return _context17.stop();
                                }
                              }
                            }, _callee17, _this);
                          }));

                          return function (_x21, _x22) {
                            return _ref17.apply(this, arguments);
                          };
                        }());

                      case 6:
                      case 'end':
                        return _context18.stop();
                    }
                  }
                }, _callee18, _this);
              }));

              return function chromeDeviceEmulationInput(_x20) {
                return _ref16.apply(this, arguments);
              };
            }();

            chromeDeviceEmulationGoBack = function () {
              var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { offset: 1 };
                var history, offset;
                return regeneratorRuntime.wrap(function _callee19$(_context19) {
                  while (1) {
                    switch (_context19.prev = _context19.next) {
                      case 0:
                        _context19.next = 2;
                        return Page.getNavigationHistory();

                      case 2:
                        history = _context19.sent;
                        offset = options.match ? _lodash2.default.findLastIndex(history.entries, function (entry) {
                          return _logger2.default.info(serial + ' > ' + decodeURIComponent(entry.url)), options.match.test(entry.url);
                        }) : history.currentIndex - options.offset;
                        _context19.next = 6;
                        return Page.navigateToHistoryEntry({ entryId: _lodash2.default.nth(history.entries, offset).id });

                      case 6:
                      case 'end':
                        return _context19.stop();
                    }
                  }
                }, _callee19, _this);
              }));

              return function chromeDeviceEmulationGoBack() {
                return _ref21.apply(this, arguments);
              };
            }();

            _context21.prev = 11;
            keywords = _lodash2.default.uniqBy(KEYWORDS_TARGET, 'keyword');
            ks = [];

            ks.push(_lodash2.default.sample(_lodash2.default.filter(keywords, function (k) {
              return !_lodash2.default.includes(ks, k);
            })));
            ks.push(_lodash2.default.sample(_lodash2.default.filter(keywords, function (k) {
              return !_lodash2.default.includes(ks, k);
            })));
            _logger2.default.info(serial + ' > keywords: "' + ks[0].keyword + '", "' + ks[1].keyword + '"');

            _context21.next = 19;
            return Runtime.enable();

          case 19:
            _context21.next = 21;
            return Network.enable();

          case 21:
            _context21.next = 23;
            return Page.enable();

          case 23:
            _context21.next = 25;
            return chromeDeviceEmulation();

          case 25:
            _context21.next = 27;
            return Page.navigate({ url: 'http://m.naver.com' });

          case 27:
            _context21.next = 29;
            return new _bluebird2.default(function (resolve, reject) {
              var action = 0;
              Page.loadEventFired(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
                var offset, k;
                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                  while (1) {
                    switch (_context20.prev = _context20.next) {
                      case 0:
                        _context20.prev = 0;
                        _context20.next = 3;
                        return _bluebird2.default.delay(3000);

                      case 3:
                        offset = Math.floor(action / 3);

                        if (!(ks.length <= offset)) {
                          _context20.next = 6;
                          break;
                        }

                        return _context20.abrupt('return', resolve());

                      case 6:
                        k = _lodash2.default.nth(ks, offset);

                        _logger2.default.info(serial + ' > keyword: (' + action + '/' + offset + ') "' + k.keyword + '"');
                        _context20.t0 = action++ % 3;
                        _context20.next = _context20.t0 === 0 ? 11 : _context20.t0 === 1 ? 14 : _context20.t0 === 2 ? 17 : 22;
                        break;

                      case 11:
                        _context20.next = 13;
                        return chromeDeviceEmulationInput('#query, #nx_query', { text: k.keyword + '\r\n' });

                      case 13:
                        return _context20.abrupt('break', 22);

                      case 14:
                        _context20.next = 16;
                        return chromeDeviceEmulationTouch('.total_wrap a[class*=tit], .total_wrap a [class*=tit]', { random: true });

                      case 16:
                        return _context20.abrupt('break', 22);

                      case 17:
                        _context20.next = 19;
                        return _bluebird2.default.mapSeries(_lodash2.default.range(_lodash2.default.random(3, 10)), function () {
                          return chromeDeviceEmulationSwipe({ direction: 'd' });
                        });

                      case 19:
                        _context20.next = 21;
                        return chromeDeviceEmulationGoBack({ match: /^https?:\/\/m\.search\.naver\.com/g });

                      case 21:
                        return _context20.abrupt('break', 22);

                      case 22:
                        _context20.next = 27;
                        break;

                      case 24:
                        _context20.prev = 24;
                        _context20.t1 = _context20['catch'](0);

                        reject(_context20.t1);

                      case 27:
                      case 'end':
                        return _context20.stop();
                    }
                  }
                }, _callee20, _this, [[0, 24]]);
              })));
            });

          case 29:
            _context21.next = 34;
            break;

          case 31:
            _context21.prev = 31;
            _context21.t0 = _context21['catch'](11);

            _logger2.default.error(_context21.t0);

          case 34:
            _context21.prev = 34;
            _context21.next = 37;
            return chrome.close();

          case 37:
            _context21.next = 39;
            return adb.shellWait(serial, 'su -c \'killall com.android.chrome\' root');

          case 39:
            return _context21.finish(34);

          case 40:
          case 'end':
            return _context21.stop();
        }
      }
    }, _callee21, this, [[11, 31, 34, 40]]);
  }));

  function ControllerDevice(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return ControllerDevice;
}();