import _ from 'lodash';
import Promise from 'bluebird';

import ADB from 'adbkit';
import 'adbkit-evilscan';
import 'adbkit-puppeteer';
import 'adbkit-network-manager';

const interest = require('../interest.json');
const client = ADB.createClient();
client.trackDevices().then(function(tracker) {
  const devices = {};
  tracker.on('add', async (device) => {
    console.log('Device %s was plugged in', device.id);
    devices[device.id] = (async function repeater() {
      try {
        const browser = await client.puppeteer(device.id, {
          port: 9222,
          // noReset: true,
          handler: {
            async chrome_preload() {
              // await client.networkWiFi(device.id, { state: false });
              await client.networkCellular(device.id, { state: false });
              await client.networkCellular(device.id, { state: true });
              // const cache_id = _.random(1, 10000);
              // await client.shellWait(device.id, `su -c 'mkdir -p /sdcard/chrome-cache' root`);
              // await client.shellWait(device.id, `su -c 'mkdir -p /data/local/tmp/chrome-cache/${cache_id}' root`);
              // await client.shellWait(device.id, `su -c 'chmod a+rwx /data/local/tmp/chrome-cache/${cache_id}' root`);
              // await client.shellWait(device.id, `su -c 'ln -sf /data/local/tmp/chrome-cache/${cache_id} /sdcard/chrome-cache/${cache_id}' root`);
              // await client.shellWait(device.id, `su -c 'rm -rf /data/data/com.android.chrome/app_tabs' root`);
              // await client.shellWait(device.id, `su -c '[ -d /data/data/com.android.chrome/app_chrome ] && rm -rf /data/data/com.android.chrome/app_chrome' u0_a77`);
              // await client.shellWait(device.id, `su -c '[ -L /data/data/com.android.chrome/app_chrome ] && rm -f /data/data/com.android.chrome/app_chrome' u0_a77`);
              // await client.shellWait(device.id, `su -c 'ln -s /data/local/tmp/chrome-cache/${cache_id} /data/data/com.android.chrome/app_chrome' u0_a77`);
              // await Promise.delay(1000);
            },
            async chrome_disconnect() {
              repeater()
            },
          }
        });
        const pages = await browser.pages();
        const page = (pages.length) ? pages[0] : (await browser.newPage());
        await page.setViewport({ modelName: 'SM-G935K' });
        await page.on('dialog', (dialog) => dialog.dismiss());
        await page.on('error', (e) => console.error(serial, e));

        const exit = async () => { await page.close(); await browser.disconnect(); }
        // onCancel(exit);

        await page.goto('https://m.naver.com');
        await page.waitFor(1000);
        const q = await page.waitFor('#query');
        if(q) {
          await page.waitFor(1000);
          await q.tap();
          await q.type(`${_.sample(interest).keyword}\n`);
        }

        await page.waitFor('.total_wrap');
        const anchor = _.sample(await page.$$('.total_wrap a'));
        if(anchor){
          await page.waitFor(1000);
          await anchor.tap();
        }

        await page.waitFor(1000);
        await page.waitFor('body');
        await Promise.mapSeries(_.range(10), () => page.touchscreen.swipeDirection('d'));

        await exit();
      } catch (e) {
        console.log(e);
        // reject(e);
      }
    })();
  })
  tracker.on('remove', async (device) => {
    console.log('Device %s was unplugged', device.id);
    devices[device.id] = false;
  })
  tracker.on('end', async () => {
    console.log('Tracking stopped')

  })
})
.catch((err) => console.error('Something went wrong:', err.stack))