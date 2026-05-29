import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push('[console] ' + msg.text());
});
page.on('pageerror', err => {
  errors.push('[pageerror] ' + err.message);
});

const routes = ['/', '/checkin', '/calories', '/eatwhat', '/plan', '/progress'];
let allOk = true;

for (const route of routes) {
  errors.length = 0;
  await page.goto('http://localhost:5173' + route, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  const rootLen = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length ?? 0);
  const status = errors.length === 0 ? '✅ OK' : '❌ ERRORS';
  console.log(`${status} ${route} (root: ${rootLen} chars)`);
  if (errors.length) {
    errors.forEach(e => console.log('   ', e));
    allOk = false;
  }
}

await browser.close();
process.exit(allOk ? 0 : 1);
