import _ from 'lodash';
import Promise from 'bluebird';

import Easing from 'easing';
import Korean from 'hangul-js';

import CDP from 'chrome-remote-interface';

import * as DEVICE_INFOS from '../devices';

Promise.resolve()
.then(async () => {
  const chrome = await CDP({ local: true });

  const { Runtime, Network, Page, Emulation, DOM, Input } = chrome;
  const chromeDeviceEmulation = async (modelName = 'SM-G935K') => {
    const model = _.get(DEVICE_INFOS, 'SM-G935K', DEVICE_INFOS.COMMON || {});
    const isMobile = (model['window.navigator.platform'] || "").indexOf('arm') !== -1;
    await (Network.setUserAgentOverride || Emulation.setUserAgentOverride)({
      userAgent: model['window.navigator.userAgent'],
      // acceptLanguage: model['window.navigator.platform'],
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
  const chromeDeviceEmulationTouch = async (selector, options = {}) => {
    const document = await DOM.getDocument();
    const metrics = await Page.getLayoutMetrics();
    
    const element = await DOM.querySelector({ nodeId: document.root.nodeId, selector: selector });
    const elementBox = await DOM.getBoxModel(element);
    const elementRect = _.zipObject(['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'x4', 'y4'], _.get(elementBox, 'model.content'));
    const bounding = {
      left: Math.min(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4),
      right: Math.max(elementRect.x1, elementRect.x2, elementRect.x3, elementRect.x4),
      top: Math.min(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4),
      bottom: Math.max(elementRect.y1, elementRect.y2, elementRect.y3, elementRect.y4)
    }

    const cx = metrics.layoutViewport.clientWidth / 2;
    const cy = metrics.layoutViewport.clientHeight / 2;
    const cxl = cx / 3;
    const cyl = cy / 3;

    const boundingT = bounding.top >= 0;
    const boundingL = bounding.left >= 0;
    const boundingB = bounding.bottom <= metrics.layoutViewport.clientHeight;
    const boundingR = bounding.right <= metrics.layoutViewport.clientWidth;
    
    switch(true) {
      case !boundingT:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy + (cyl * ratio) }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouch(selector, options);
      break;
      case !boundingB:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx, y: cy - (cyl * ratio) }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouch(selector, options);
      break;
      case !boundingL:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx + (cxl * ratio), y: cy }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouch(selector, options);
      break;
      case !boundingR:
        await Input.dispatchTouchEvent({ type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
        await Promise.mapSeries(Easing(_.random(10, 20), 'linear'), async (ratio) => {
          await Input.dispatchTouchEvent({ type: 'touchMove' , touchPoints: [{ x: cx - (cxl * ratio), y: cy }] });
          await Promise.delay(_.random(10, 70));
        })
        await Input.dispatchTouchEvent({ type: 'touchEnd'  , touchPoints: [] });
        await chromeDeviceEmulationTouch(selector, options);
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

  try {
    await Runtime.enable();
    await Network.enable();
    await Page.enable();

    await chromeDeviceEmulation();
    // await Page.navigate({url: 'https://jsbin.com/cecuzeb/edit?output'});
    // await Page.navigate({url: 'http://167.99.66.63/info.php'});
    await Page.navigate({url: 'http://m.naver.com'});
    await Promise.delay(3000);
    // await Page.navigate({url: 'data:text/html;base64,PCFET0NUWVBFIGh0bWw+DQo8aHRtbD4NCjxoZWFkPg0KICA8bWV0YSBjaGFyc2V0PSJ1dGYtOCI+DQogIDxtZXRhIG5hbWU9InZpZXdwb3J0IiBjb250ZW50PSJ3aWR0aD1kZXZpY2Utd2lkdGgiPg0KICA8dGl0bGU+SlMgQmluPC90aXRsZT4NCiAgPHN0eWxlPg0KICAgIC5jb250YWluZXIgeyBkaXNwbGF5OmZsZXg7IHdpZHRoOjEwMCU7IGhlaWdodDoxMDAlOyBmbGV4LWRpcmVjdGlvbjpjb2x1bW47IH0NCiAgICAuY29udGFpbmVyID4gaW5wdXQgeyBmbGV4OiBhdXRvOyB9DQogICAgLmNvbnRhaW5lciA+IHRleHRhcmVhIHsgZmxleDogMTsgfQ0KICA8L3N0eWxlPg0KPC9oZWFkPg0KPGJvZHk+DQo8ZGl2IGNsYXNzPSJjb250YWluZXIiPg0KICA8aW5wdXQgdHlwZT0idGV4dCIgLz4NCiAgPHRleHRhcmVhIHJvd3M9IjE2Ij48L3RleHRhcmVhPg0KPC9kaXY+DQo8c2NyaXB0Pg0KICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9dGV4dF0nKTsNCmNvbnN0IG91dHB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3RleHRhcmVhJyk7DQpjb25zdCBsb2dnZXIgPSAoZSkgPT4gew0KCWNvbnN0IGxpbmVzID0gb3V0cHV0LnZhbHVlLnNwbGl0KCdcbicpOw0KICBjb25zdCBjb21wb3NpdGlvbkV2ZW50cyA9IFsnaXNUcnVzdGVkJywgJ3R5cGUnLCAnZGF0YScsICdsb2NhbGUnXQ0KICBjb25zdCBpbnB1dEV2ZW50cyA9IFsnaXNUcnVzdGVkJywgJ3R5cGUnLCAnZGF0YScsICdkYXRhVHJhbnNmZXInLCAnaW5wdXRUeXBlJywgJ2lzQ29tcG9zaW5nJ10NCiAgY29uc3Qga2V5Ym9hcmRFdmVudHMgPSBbJ2lzVHJ1c3RlZCcsICd0eXBlJywgJ2NoYXInLCAnYWx0S2V5JywgJ2NoYXJDb2RlJywgJ2NvZGUnLCAnY3RybEtleScsICdpc0NvbXBvc2lvbmcnLCAna2V5JywgJ2tleUNvZGUnLCAna2V5SWRlbnRpZmllcicsICdrZXlMb2NhdGlvbicsICdsb2NhbGUnLCAnbG9jYXRpb24nLCAnbWV0YUtleScsICdyZXBlYXQnLCAnc2hpZnRLZXknLCAnd2hpY2gnXQ0KICBpZihlIGluc3RhbmNlb2YgSW5wdXRFdmVudCkgew0KICAJbGluZXMudW5zaGlmdChpbnB1dEV2ZW50cy5tYXAoKGspPT5rKyc9JytlW2tdKS5qb2luKCcsICcpKTsNCiAgfWVsc2UNCiAgaWYoZSBpbnN0YW5jZW9mIENvbXBvc2l0aW9uRXZlbnQpIHsNCiAgCWxpbmVzLnVuc2hpZnQoY29tcG9zaXRpb25FdmVudHMubWFwKChrKT0+aysnPScrZVtrXSkuam9pbignLCAnKSk7DQogIH1lbHNlDQogIGlmKGUgaW5zdGFuY2VvZiBLZXlib2FyZEV2ZW50KSB7DQogIAlsaW5lcy51bnNoaWZ0KGtleWJvYXJkRXZlbnRzLm1hcCgoayk9PmsrJz0nK2Vba10pLmpvaW4oJywgJykpOw0KICB9DQogIA0KICBjb25zb2xlLmxvZyhlLnR5cGUsIGUuY29uc3RydWN0b3IpDQogIG91dHB1dC52YWx1ZSA9IGxpbmVzLmpvaW4oJ1xuJyk7DQp9DQppbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBsb2dnZXIsIGZhbHNlKTsNCmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgbG9nZ2VyLCBmYWxzZSk7DQppbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgbG9nZ2VyLCBmYWxzZSk7DQppbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGxvZ2dlciwgZmFsc2UpOw0KaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBsb2dnZXIsIGZhbHNlKTsNCmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9uc3RhcnQnLCBsb2dnZXIsIGZhbHNlKTsNCmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9udXBkYXRlJywgbG9nZ2VyLCBmYWxzZSk7DQppbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjb21wb3NpdGlvbmVuZCcsIGxvZ2dlciwgZmFsc2UpOw0KICA8L3NjcmlwdD4NCjwvYm9keT4NCjwvaHRtbD4='});
    // await Page.loadEventFired();
    await chromeDeviceEmulationInput('input#query', { text: '동해물과 백두' });
    // await chromeDeviceEmulationTouch('a.fot_p2a');
    
    await Promise.delay(30000);
  } catch (e) {
    console.error(e);
  } finally {
    chrome.close();
  }
  
  await Promise.delay(3000);
})