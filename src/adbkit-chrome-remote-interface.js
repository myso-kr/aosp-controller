import console from './logger';

import _ from 'lodash';
import Promise from 'bluebird';

import CDP from 'chrome-remote-interface';
import Client from 'adbkit/lib/adb/client';

const CHROME_PACKAGES = 'com.android.chrome'
const CHROME_ACTIVITY = 'com.google.android.apps.chrome.Main';
const CHROME_PROTOCOL = 'localabstract:chrome_devtools_remote';

class ChromeRemoteInterface {
  constructor(options = {}, serial, adb) {
    this.defs = {
      host: '127.0.0.1',
      port: 9222,
      secure: false,
      local: true, /* Chrome 62... has Bug! */
      chrome: {
        reset: true,
        args: [],
        async onReset() {
          console.info(serial, `chrome_reset`);
        },
        async onPreload() {
          console.info(serial, `chrome_preload`);
        },
        async onLoad() {
          console.info(serial, `chrome_load`);
        },
        async onConnect() {
          console.info(serial, `chrome_connect`);
        },
        async onDisconnect() {
          console.info(serial, `chrome_disconnect`);
        }
      },
    };
    this.opts = _.defaultsDeep(options, this.defs);
    this.serial = serial;
    this.adb = adb;
  }

  async Connect(options = {}) {
    const opts = _.assign(options, this.opts);
    if(this.adb instanceof Client) {
      // --------- for Android
      const has_chrome_android = await this.adb.isInstalled(this.serial, CHROME_PACKAGES);
      if(!has_chrome_android) { throw new Error('chrome not found!'); }
      // chrome forward
      await this.adb.forward(this.serial, `tcp:${opts.port}`, CHROME_PROTOCOL).delay(1000);
      // chrome run
      const chromeCommandLine = [];
      chromeCommandLine.push('--disable-fre');
      chromeCommandLine.push('--no-default-browser-check');
      chromeCommandLine.push('--no-first-run');
      chromeCommandLine.push('--ignore-certificate-errors');
      chromeCommandLine.push.apply(chromeCommandLine, opts.chrome.args);
      await this.adb.shellWait(this.serial, `am force-stop ${CHROME_PACKAGES}`);
      if(opts.chrome.reset) {
        await this.adb.shellWait(this.serial, `pm clear ${CHROME_PACKAGES}`);
        /* CALLBACK */ await opts.chrome.onReset();
      }
      /* CALLBACK */ await opts.chrome.onPreload();
      await this.adb.shellWait(this.serial, `echo "chrome ${chromeCommandLine.join(' ')}" > /data/local/tmp/chrome-command-line`);
      await this.adb.shellWait(this.serial, `am set-debug-app --persistent ${CHROME_PACKAGES}`);
      await this.adb.shellWait(this.serial, `am start -n ${CHROME_PACKAGES}/${CHROME_ACTIVITY} -d 'data:,'`);
      await Promise.delay(5000);
      /* CALLBACK */ await opts.chrome.onLoad();
    } else {
      // --------- for Desktop
    }
    this.client = await CDP(opts);
    /* CALLBACK */ this.client.once('ready', opts.chrome.onConnect);
    /* CALLBACK */ this.client.once('disconnect', opts.chrome.onDisconnect);
    return this;
  }

  async Protocol(options = {}) {
    return CDP.Protocol(_.assign({}, options, this.opts));
  }

  async List(options = {}) {
    return CDP.List(_.assign({}, options, this.opts));
  }

  async New(options = {}) {
    return CDP.New(_.assign({}, options, this.opts));
  }

  async Activate(options = {}) {
    return CDP.Activate(_.assign({}, options, this.opts));
  }

  async Close(options = {}) {
    return CDP.Close(_.assign({}, options, this.opts));
  }

  async Version(options = {}) {
    return CDP.Version(_.assign({}, options, this.opts));
  }

  async on(eventName, callback) {
    this.client.on(eventName, callback);
    return this;
  }

  async once(eventName, callback) {
    this.client.once(eventName, callback);
    return this;
  }

  async send(method, params) {
    return this.client.send(method, params);
  }

  async close() {
    return this.client.close();
  }

  get Accessibility() { return this.client.Accessibility; }
  get Animation() { return this.client.Animation; }
  get ApplicationCache() { return this.client.ApplicationCache; }
  get Audits() { return this.client.Audits; }
  get Browser() { return this.client.Browser; }
  get CSS() { return this.client.CSS; }
  get CacheStorage() { return this.client.CacheStorage; }
  get DOM() { return this.client.DOM; }
  get DOMDebugger() { return this.client.DOMDebugger; }
  get DOMSnapshot() { return this.client.DOMSnapshot; }
  get DOMStorage() { return this.client.DOMStorage; }
  get Database() { return this.client.Database; }
  get DeviceOrientation() { return this.client.DeviceOrientation; }
  get Emulation() { return this.client.Emulation; }
  get HeadlessExperimental() { return this.client.HeadlessExperimental; }
  get IO() { return this.client.IO; }
  get IndexedDB() { return this.client.IndexedDB; }
  get Input() { return this.client.Input; }
  get Inspector() { return this.client.Inspector; }
  get LayerTree() { return this.client.LayerTree; }
  get Log() { return this.client.Log; }
  get Memory() { return this.client.Memory; }
  get Network() { return this.client.Network; }
  get Overlay() { return this.client.Overlay; }
  get Page() { return this.client.Page; }
  get Performance() { return this.client.Performance; }
  get Security() { return this.client.Security; }
  get ServiceWorker() { return this.client.ServiceWorker; }
  get Storage() { return this.client.Storage; }
  get SystemInfo() { return this.client.SystemInfo; }
  get Target() { return this.client.Target; }
  get Tethering() { return this.client.Tethering; }
  get Tracing() { return this.client.Tracing; }
  get Console() { return this.client.Console; }
  get Debugger() { return this.client.Debugger; }
  get HeapProfiler() { return this.client.HeapProfiler; }
  get Profiler() { return this.client.Profiler; }
  get Runtime() { return this.client.Runtime; }
  get Schema() { return this.client.Schema; }
}

Client.prototype.chrome = async function(serial, options = {}) {
  return new ChromeRemoteInterface(options, serial, this).Connect();
}