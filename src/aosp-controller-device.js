import console from './logger';

import _ from 'lodash';
import Promise from 'bluebird';
import * as DEVICE_INFOS from '../devices';

import moment from 'moment';

import Easing from 'easing';
import Korean from 'hangul-js';

const CHROME_CACHE_SIZE = 600;
const CHROME_CACHE_BASE = '/data/local/chrome-cache/';
const CHROME_CACHE_APPS = '/data/data/com.android.chrome/app_chrome';
const CHROME_CACHE_TABS = '/data/data/com.android.chrome/app_tabs';

const TRENDS_TIMELINES   = require('../trends-timeline.json');

const KEYWORDS_TARGET   = require('../target.json');
const KEYWORDS_TARGET_A_AB   = require('../target-test-001.json');
const KEYWORDS_TARGET_A_ABC  = require('../target-test-002.json');
const KEYWORDS_TARGET_AB_BC  = require('../target-test-003.json');
const KEYWORDS_INTEREST = require('../interest.json');

export default async function ControllerDevice(adb, serial, rooted) {
  console.info(`Loop Controller Device by ${serial}`);
  const chrome = await ControllerDeviceChrome(adb, serial, rooted);
  const { Runtime, Network, Page, Emulation, DOM, Input } = chrome;
  const chromeDeviceEmulation = async (modelName = 'SM-G935K') => {
    const model = _.get(DEVICE_INFOS, 'SM-G935K', DEVICE_INFOS.COMMON || {});
    const isMobile = (model['window.navigator.platform'] || "").indexOf('arm') !== -1;
    await (Network.setUserAgentOverride || Emulation.setUserAgentOverride)({
      userAgent: model['window.navigator.userAgent'],
      acceptLanguage: model['window.navigator.language'],
      platform: model['window.navigator.platform']
    });
    await Emulation.setDeviceMetricsOverride({
      width: model['window.outerWidth'],
      height: model['window.outerHeight'],
      mobile: isMobile,
      deviceScaleFactor: model['window.devicePixelRatio'],
      screenWidth: model['window.screen.width'],
      screenHeight: model['window.screen.height'],
    });
    await Emulation.setTouchEmulationEnabled({
      enabled: isMobile,
      maxTouchPoints: model['window.navigator.maxTouchPoints']
    });
    const overrides = _.map(model, (value, path) => {
      const attrName = _.join(_.dropRight(path.split('.')), '.');
      const attrType = _.nth(path.split('.'), -1);
      const attrValue = _.isString(value) ? `"${value}"` : value;
      return `${attrName}.__defineGetter__("${attrType}", function() { return ${attrValue}; });`;
    });
    overrides.push(`delete navigator.__proto__.webdriver;`);
    overrides.push(`
      if(!window.Bluetooth){
        window.Bluetooth = class Bluetooth {
          get [Symbol.toStringTag]() { return "Bluetooth"; }
        } 
      }
    `);
    overrides.push(`window.navigator.__defineGetter__("bluetooth", function () { return new Bluetooth(); })`);
    overrides.push(`
      if(!window.MediaSession){
        window.MediaSession = class MediaSession {
          constructor(metadata, playbackState) {
            this.metadata = metadata;
            this.playbackState = playbackState;
          }
        };
      }
    `);
    overrides.push(`window.navigator.__defineGetter__("mediaSession", function () { return new MediaSession(null, "none"); }`);
    overrides.push(`
      if(window.UNMASKED_RENDERER_WEBGL && window.UNMASKED_VENDOR_WEBGL) {
        WebGLRenderingContext.prototype.getParameter = (function(o) {
          return function(param){
            var info = this.getExtension("WEBGL_debug_renderer_info");
            if(param === info.UNMASKED_RENDERER_WEBGL) return window.UNMASKED_RENDERER_WEBGL;
            if(param === info.UNMASKED_VENDOR_WEBGL)   return window.UNMASKED_VENDOR_WEBGL;
            return o.apply(this, [param]);
          }
        })(WebGLRenderingContext.prototype.getParameter);
      }
    `);
    overrides.push(`
      if(window.UNMASKED_RENDERER_WEBGL && window.UNMASKED_VENDOR_WEBGL) {
        WebGL2RenderingContext.prototype.getParameter = (function(o) {
          return function(param){
            var info = this.getExtension("WEBGL_debug_renderer_info");
            if(param === info.UNMASKED_RENDERER_WEBGL) return window.UNMASKED_RENDERER_WEBGL;
            if(param === info.UNMASKED_VENDOR_WEBGL)   return window.UNMASKED_VENDOR_WEBGL;
            return o.apply(this, [param]);
          }
        })(WebGL2RenderingContext.prototype.getParameter);
      }
    `);
    await Page.addScriptToEvaluateOnNewDocument({ source: overrides.join(';\n') });
    await Page.javascriptDialogOpening(async ({message, type}) => {
        try {
            await Page.handleJavaScriptDialog({accept: true});
            console.info(`${serial} > ${type}: ${message} -> accepted!`);
        } catch (err) {
            console.error(err);
        }
    });
  }
  const chromeDeviceEmulationSwipe = async (options = {}) => {
    const metrics = await Page.getLayoutMetrics();
    const cx = metrics.layoutViewport.clientWidth / 2;
    const cy = metrics.layoutViewport.clientHeight / 2;
    const mx = cx / 4;
    const my = cy / 4;
    switch(options.direction.toLowerCase()) {
      case 'u': case 'up':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy + (my * ratio) }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
      case 'd': case 'down':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy - (my * ratio) }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
      case 'r': case 'right':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx + (mx * ratio), y: cy }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
      case 'l': case 'left':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx - (mx * ratio), y: cy }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
    }
  }
  const chromeDeviceEmulationTouch = async (selector, options = {}) => {
    try {
      const document = await DOM.getDocument();
      const elements = await DOM.querySelectorAll({ nodeId: document.root.nodeId, selector: selector });
      return chromeDeviceEmulationTouchElement({ nodeId: (options.random) ? _.sample(elements.nodeIds) : _.nth(elements.nodeIds, 0) }, options);
    } catch(e) {
      if(options.random) return chromeDeviceEmulationTouch(selector, options);
      throw e;
    }
  }
  const chromeDeviceEmulationTouchElement = async (element, options = {}) => {
    const metrics = await Page.getLayoutMetrics();
    const elementBox = await DOM.getBoxModel(element);
    const elementRect = _.zipObject(['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4'], _.get(elementBox, 'model.content'));
    const bounding = {
      left: Math.min(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4) + 5,
      right: Math.max(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4) - 5,
      top: Math.min(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4) + 5,
      bottom: Math.max(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4) - 5
    }

    const cx = metrics.layoutViewport.clientWidth / 2;
    const cy = metrics.layoutViewport.clientHeight / 2;
    const mx = cx / 4;
    const my = cy / 4;

    const boundingT = bounding.top >= 0;
    const boundingL = bounding.left >= 0;
    const boundingB = bounding.bottom <= metrics.layoutViewport.clientHeight;
    const boundingR = bounding.right <= metrics.layoutViewport.clientWidth;
    
    switch(true) {
      case !boundingT:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy + (my * ratio) }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      case !boundingB:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy - (my * ratio) }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      case !boundingL:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx + (mx * ratio), y: cy }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      case !boundingR:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(5, 10), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx - (mx * ratio), y: cy }] });
          await Promise.delay(_.random(100, 150));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      default:
        const dx = _.get(options, 'x', _.random(bounding.left, bounding.right));
        const dy = _.get(options, 'y', _.random(bounding.top, bounding.bottom));
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{x: dx, y: dy}] });
        await Input.dispatchTouchEvent({ type: 'touchMove', touchPoints: [{x: dx, y: dy}] });
        await Input.dispatchTouchEvent({ type: 'touchEnd', touchPoints: [] });
        await Promise.delay(1000);
    }
  }
  const chromeDeviceEmulationInput = async (selector, options = {}) => {
    let isComposing = false;
    const chars = Korean.d(_.get(options, 'text', ''));
    await chromeDeviceEmulationTouch(selector, options);
    await Promise.mapSeries(chars, async (char, offset) => {
      const input = Korean.a(chars.slice(0, offset + 1));
      const inputLast = input.substr(-1);
      const charCode = inputLast.charCodeAt(0);
      const isKorean = false || (0x1100 <= charCode && charCode <= 0x1112) || (0x1161 <= charCode && charCode <= 0x1175) || (0x11A8 <= charCode && charCode <= 0x11C2) || (0xAC00 <= charCode && charCode <= 0xD7A3);
      return Promise.resolve()
      // KeyDown
      .then(async () => {
        if(isKorean) {
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'rawKeyDown', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'keyDown', code: '', key: 'Unidentified', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });
        } else {
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'rawKeyDown', windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'keyDown', windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });
        }
      }).delay(_.random(30, 70))
      // Composition
      .then(async () => {
        if(isKorean) {
          if(!isComposing) {
            await Runtime.evaluate({ userGesture: false, expression: `document.activeElement.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));` });
          }
          isComposing = true;
          await Runtime.evaluate({ userGesture: false, expression: `document.activeElement.dispatchEvent(new CompositionEvent('compositionupdate', { data: '${inputLast}' }));` });
          await Runtime.evaluate({ userGesture: false, expression: `document.activeElement.value = '${input.substring(0, input.length - 1)}'` });
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'char', text: inputLast, windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });
          await Promise.delay(100);
        } else {
          if(isComposing) {
            await Runtime.evaluate({ userGesture: false, expression: `document.activeElement.dispatchEvent(new CompositionEvent('compositionend', { data: '${inputLast}' }));` });
          }
          isComposing = false;
          // await Runtime.evaluate({ userGesture: false, expression: `document.activeElement.value = '${input.substring(0, input.length - 1)}'` });
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'char', text: char, windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });
        }
      }).delay(_.random(30, 70))
      // KeyUp
      .then(async () => {
        if(isKorean) {
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'keyUp', code: '', key: 'Unidentified', windowsVirtualKeyCode: 229, nativeVirtualKeyCode: 229 });  
        } else {
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'keyUp', windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });  
        }
      }).delay(_.random(70, 100))
      .then(() => Page.bringToFront())
    });
  }
  const chromeDeviceEmulationGoBack = async (options = { offset: 1 }) => {
    const history = await Page.getNavigationHistory();
    const offset = (options.match) ? _.findLastIndex(history.entries, (entry)=>(console.info(`${serial} > ${decodeURIComponent(entry.url)}`), options.match.test(entry.url))) : (history.currentIndex - options.offset);
    await Page.navigateToHistoryEntry({ entryId: _.nth(history.entries, offset).id });
  }

  try {
    const TRENDS_TIMELINE = _.nth(TRENDS_TIMELINES, moment().isoWeekday() % 7);
    const TRENDS_TIMELINE_HOUR = _.nth(TRENDS_TIMELINE, moment().hours());
    console.info(`${serial} > Target Keyword Chance: ${TRENDS_TIMELINE_HOUR}%`);

    
    const ks = [];
    let KEYWORDS_PLATFORM = KEYWORDS_INTEREST;
    if(_.random(0, 100) < TRENDS_TIMELINE_HOUR) {
      if(_.startsWith(serial, '192.168.10.')) {
        KEYWORDS_PLATFORM = KEYWORDS_TARGET_A_AB;
      }else
      if(_.startsWith(serial, '192.168.11.')) {
        KEYWORDS_PLATFORM = KEYWORDS_TARGET_A_ABC;
      }else
      if(_.startsWith(serial, '192.168.12.')) {
        KEYWORDS_PLATFORM = KEYWORDS_TARGET_AB_BC;
      }else{
        KEYWORDS_PLATFORM = KEYWORDS_TARGET;
        if(_.random(0, 100) < 30) ks.push(KEYWORDS_PLATFORM[0]);
      }
    }
    if(ks.length < 2) ks.push(_.sample(_.filter(_.uniqBy(KEYWORDS_PLATFORM, 'keyword'), (k) => !_.includes(ks, k))));
    if(ks.length < 2) ks.push(_.sample(_.filter(_.uniqBy(KEYWORDS_PLATFORM, 'keyword'), (k) => !_.includes(ks, k))));
    console.info(`${serial} > keywords: "${ks[0].keyword}", "${ks[1].keyword}"`);

    await Runtime.enable();
    await Network.enable();
    await Page.enable();

    await chromeDeviceEmulation();
    await Page.navigate({url: 'http://m.naver.com'});
    await new Promise((resolve, reject) => {
      let action = 0;
      Page.loadEventFired(async () => {
        try {
          await Promise.delay(3000);
          const offset = Math.floor(action / 3);
          if(ks.length <= offset) return resolve();
          const k = _.nth(ks, offset);
          console.info(`${serial} > keyword: (${action}/${offset}) "${k.keyword}"`);
          switch(action++ % 3) {
            case 0:
              await chromeDeviceEmulationInput('#query, #nx_query', { text: `${k.keyword}\r\n` });
            break;
            case 1:
              await chromeDeviceEmulationTouch('.total_wrap a[class*=tit], .total_wrap a [class*=tit]', { random: true });
            break;
            case 2:
              await Promise.mapSeries(_.range(_.random(3, 10)), () => chromeDeviceEmulationSwipe({ direction: 'd' }));
              await chromeDeviceEmulationGoBack({ match: /^https?:\/\/m\.search\.naver\.com/g });
            break;
          }
        } catch(e) {
          reject(e);
        }
      });
    })
  } catch (e) {
    console.error(`${serial} > ${e.message}`);
  } finally {
    await chrome.close();
    await adb.shellWait(serial, `su -c 'killall com.android.chrome' root`);
  }
}

export async function ControllerDeviceChrome(adb, serial, rooted) {
  const forwards = await adb.listForwards(serial);
  const forward = _.find(forwards, { serial, remote: 'localabstract:chrome_devtools_remote' });
  const forwardPorts = _.map(forwards, (forward) => parseInt(forward.local.replace(/[^\d]/g, '')));
  const forwardPortRange = _.range(9223, 9323);

  const port = parseInt(_.get(forward, 'local', _.sample(_.xor(forwardPortRange, forwardPorts))));
  if(!port) {
    throw new Error(`${serial} > can not open chrome remote port !`);
  } else {
    console.info(`${serial} > chrome remort port open (${port})`);
  }

  if(rooted) {
    const timestamp = moment().add(10, 'm');
    await adb.shellWait(serial, `su -c 'killall crond' root`);
    await adb.shellWait(serial, `su -c 'mkdir -p /sdcard/android/crontabs' root`);
    await adb.shellWait(serial, `su -c 'echo "${timestamp.minutes()} * * * * reboot" > /sdcard/android/crontabs/root' root`);
    await adb.shellWait(serial, `su -c 'crond -b -c /sdcard/android/crontabs' root`);
    
    const cacheListDays = await adb.shellWait(serial, `find ${CHROME_CACHE_BASE} -type d -mindepth 1 -maxdepth 1 -mtime -1`);
    const cachesDays = cacheListDays.toString().trim().split(CHROME_CACHE_BASE).join('').split('\n').map(_.toNumber);

    const cacheList = await adb.shellWait(serial, `find ${CHROME_CACHE_BASE} -type d -mindepth 1 -maxdepth 1`);
    const caches = cacheList.toString().trim().split(CHROME_CACHE_BASE).join('').split('\n').map(_.toNumber);

    const cachesFilter = (caches.length >= CHROME_CACHE_SIZE) ? _.xor(cachesDays, caches) : _.xor(caches, _.range(1, 9999));
    const cache = _.sample(cachesFilter);
    if(!cache) { throw new Error('cannot get cache'); }
    const crowner = (await adb.shellWait(serial, 'su -c "F=($(ls -ld /data/data/com.android.chrome/)) && echo ${F[2]}" root')).toString().trim() || 'root';

    console.info(`Loop Controller Chrome by ${serial}`);
    console.info(`${serial} > - MAX: ${CHROME_CACHE_SIZE}, CUR: ${caches.length}, FLT: ${cachesFilter.length}, NOW: ${cache}, USR: ${crowner}`);
    return adb.chrome(serial, {
      port: port,
      chrome: {
        reset: false,
        async onPreload() {
          await adb.shellWait(serial, `su -c 'mkdir -p ${CHROME_CACHE_BASE}${cache}' root`);
          await adb.shellWait(serial, `su -c 'chmod 777 ${CHROME_CACHE_BASE}${cache}' root`);
          await adb.shellWait(serial, `su -c 'rm -rf ${CHROME_CACHE_TABS}' root`);
          await adb.shellWait(serial, `su -c '[ -d ${CHROME_CACHE_APPS} ] && rm -rf ${CHROME_CACHE_APPS}' ${crowner}`);
          await adb.shellWait(serial, `su -c '[ -L ${CHROME_CACHE_APPS} ] && rm -f ${CHROME_CACHE_APPS}' ${crowner}`);
          await adb.shellWait(serial, `su -c 'ln -s ${CHROME_CACHE_BASE}${cache} ${CHROME_CACHE_APPS}' ${crowner}`);
        },
      }
    });
  } else {
    return adb.chrome(serial, { port: port });
  }
}