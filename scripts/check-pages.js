const puppeteer = require('puppeteer');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PAGES = ['/login', '/new-decision', '/history', '/decision/TEST_ID'];

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const results = [];

  for (const path of PAGES) {
    const page = await browser.newPage();
    const logs = [];
    const errors = [];

    page.on('console', (msg) => {
      try {
        logs.push({ type: msg.type(), text: msg.text() });
      } catch (e) {
        logs.push({ type: 'console', text: String(msg) });
      }
    });
    page.on('pageerror', (err) => {
      errors.push(String(err));
    });

    try {
      const res = await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 10000 });
      const status = res && res.status ? res.status() : 'no-response';
      const title = await page.title().catch(() => '(no title)');
      results.push({ path, status, title, logs, errors });
    } catch (err) {
      results.push({ path, status: 'error', title: null, logs, errors: [String(err)] });
    }

    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
})();
