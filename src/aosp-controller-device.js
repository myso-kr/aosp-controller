import _ from 'lodash';
import Promise from 'bluebird';
import * as DEVICE_INFOS from '../devices';

import Easing from 'easing';
import Korean from 'hangul-js';

const CHROME_CACHE_SIZE = 600;
const CHROME_CACHE_BASE = '/data/local/chrome-cache/';
const CHROME_CACHE_APPS = '/data/data/com.android.chrome/app_chrome';
const CHROME_CACHE_TABS = '/data/data/com.android.chrome/app_tabs';


// const KEYWORDS_TARGET   = require('../target.json');
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
    await Page.addScriptToEvaluateOnNewDocument({ source: overrides.join(';\n') });
  }
  const chromeDeviceEmulationSwipe = async (options = {}) => {
    const metrics = await Page.getLayoutMetrics();
    const cx = metrics.layoutViewport.clientWidth / 2;
    const cy = metrics.layoutViewport.clientHeight / 2;
    const mx = cx / 3;
    const my = cy / 3;
    switch(options.direction.toLowerCase()) {
      case 'u': case 'up':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy + (my * ratio) }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
      case 'd': case 'down':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy - (my * ratio) }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
      case 'r': case 'right':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx + (mx * ratio), y: cy }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
      case 'l': case 'left':
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx - (mx * ratio), y: cy }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
      break;
    }
  }
  const chromeDeviceEmulationTouch = async (selector, options = {}) => {
    const document = await DOM.getDocument();
    const elements = await DOM.querySelectorAll({ nodeId: document.root.nodeId, selector: selector });
    return chromeDeviceEmulationTouchElement({ nodeId: (options.random) ? _.sample(elements.nodeIds) : _.nth(elements.nodeIds, 0) }, options);
  }
  const chromeDeviceEmulationTouchElement = async (element, options = {}) => {
    const metrics = await Page.getLayoutMetrics();
    const elementBox = await DOM.getBoxModel(element);
    const elementRect = _.zipObject(['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4'], _.get(elementBox, 'model.content'));
    const bounding = {
      left: Math.min(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4) + 1,
      right: Math.max(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4) - 1,
      top: Math.min(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4) + 1,
      bottom: Math.max(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4) - 1
    }

    const cx = metrics.layoutViewport.clientWidth / 2;
    const cy = metrics.layoutViewport.clientHeight / 2;
    const mx = cx / 3;
    const my = cy / 3;

    const boundingT = bounding.top >= 0;
    const boundingL = bounding.left >= 0;
    const boundingB = bounding.bottom <= metrics.layoutViewport.clientHeight;
    const boundingR = bounding.right <= metrics.layoutViewport.clientWidth;
    
    switch(true) {
      case !boundingT:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy + (my * ratio) }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      case !boundingB:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy - (my * ratio) }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      case !boundingL:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx + (mx * ratio), y: cy }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouchElement(element, options);
      break;
      case !boundingR:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx - (mx * ratio), y: cy }] });
          await Promise.delay(_.random(10, 70));
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
    }
    await Promise.delay(1000);
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
      }).delay(_.random(10, 30))
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
          await Page.bringToFront(); await Input.dispatchKeyEvent({ type: 'char', text: char, windowsVirtualKeyCode: charCode, nativeVirtualKeyCode: charCode });
        }
      }).delay(_.random(10, 30))
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
    await Page.navigateToHistoryEntry({ entryId: _.nth(history.entries, history.currentIndex - options.offset).id });
  }

  try {
    const keywords = _.uniqBy(KEYWORDS_INTEREST, 'keyword');
    const ks = [];
    ks.push(_.sample(_.filter(keywords, (k) => !_.includes(ks, k))));
    ks.push(_.sample(_.filter(keywords, (k) => !_.includes(ks, k))));
    console.info(`${ks[0].keyword} / ${ks[1].keyword}`);

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
          console.info(`keyword offset: ${action}/${offset}`);
          if(ks.length <= offset) return resolve();
          const k = _.nth(ks, offset);
          console.info(`keyword: ${k.keyword}`);
          if (action % 3 === 0) {
            await chromeDeviceEmulationInput('#query, #nx_query', { text: `${k.keyword}\r\n` });
          }
          if (action % 3 === 1) {
            await chromeDeviceEmulationTouch('.thumb_fix, .btn_next', { random: true });
          }
          if (action % 3 === 2) {
            await Promise.mapSeries(_.range(_.random(10, 30)), () => chromeDeviceEmulationSwipe({ direction: 'd' }));
            await chromeDeviceEmulationGoBack();
          }
          action++;
        } catch(e) {
          reject(e);
        }
      });
    })
  } catch (e) {
    console.error(e);
  } finally {
    chrome.close();
  }
}

export async function ControllerDeviceChrome(adb, serial, rooted) {
  const port = parseInt(_.get(_.find(await adb.listForwards(serial), { remote: 'localabstract:chrome_devtools_remote' }), 'local', "").replace(/[^\d]/g, '') || _.random(9223, 9323));
  if(rooted) {
    await adb.shellWait(serial, `su -c 'killall crond' root`);
    await adb.shellWait(serial, `su -c 'mkdir -p /sdcard/android/crontabs' root`);
    await adb.shellWait(serial, `su -c 'echo "*/20 * * * * reboot" > /sdcard/android/crontabs/root' root`);
    await adb.shellWait(serial, `su -c 'crond -b -c /sdcard/android/crontabs' root`);
    
    const cacheList = await adb.shellWait(serial, `ls -1c ${CHROME_CACHE_BASE}`);
    const caches = cacheList.toString().trim().split('\n').map(_.toNumber);
    const cache = _.sample((caches.length >= CHROME_CACHE_SIZE) ? caches : _.xor(caches, _.range(1, 9999)));
    const crowner = (await adb.shellWait(serial, 'su -c "F=($(ls -ld /data/data/com.android.chrome/)) && echo ${F[2]}" root')).toString().trim() || 'root';

    console.info(`Loop Controller Chrome by ${serial}`);
    console.info(`- MAX: ${CHROME_CACHE_SIZE}, CUR: ${caches.length}, NOW: ${cache}, USR: ${crowner}`);
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