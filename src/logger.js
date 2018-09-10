import moment from 'moment';
import Logger from 'winston';

module.exports = Logger.createLogger({
  level: 'info',
  format: Logger.format.combine(Logger.format.timestamp(), Logger.format.printf((info)=>`${info.timestamp}\t${info.level}\t${info.message}`)),
  transports: [
    new Logger.transports.Console(),
    new Logger.transports.File({ filename: `console_${moment.format('YYYYMMDD')}.log` })
  ]
})