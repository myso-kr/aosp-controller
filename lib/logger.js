'use strict';

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = _winston2.default.createLogger({
  level: 'info',
  format: _winston2.default.format.combine(_winston2.default.format.timestamp(), _winston2.default.format.printf(function (info) {
    return info.timestamp + '\t' + info.level + '\t' + info.message;
  })),
  transports: [new _winston2.default.transports.Console(), new _winston2.default.transports.File({ filename: 'console.log' })]
});