import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
mkdirSync('artifacts', { recursive: true });
const results = [];
for (const width of [375, 430, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'Shopper — Buy & Sell Marketplace');
  assert.equal(
    await page.locator('meta[property="og:site_name"]').getAttribute('content'),
    'Shopper',
  );
  const logo = page.locator('header .brand-logo');
  assert.equal(await logo.getAttribute('href'), '/');
  const mark = await logo
    .locator('img')
    .evaluate((img) => ({
      loaded: img.complete && img.naturalWidth > 0,
      width: img.getBoundingClientRect().width,
      height: img.getBoundingClientRect().height,
      fit: getComputedStyle(img).objectFit,
    }));
  assert.ok(mark.loaded);
  assert.equal(mark.width, mark.height);
  assert.equal(mark.fit, 'contain');
  assert.ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  const icon = await page.locator('link[rel="icon"]').first().getAttribute('href');
  assert.ok(icon?.includes('/icon.png'));
  const response = await page.request.get(new URL(icon, page.url()).href);
  assert.equal(response.status(), 200);
  assert.match(response.headers()['content-type'], /image\/png/);
  await page.screenshot({ path: `artifacts/shopper-${width}.png` });
  results.push({ width, title: await page.title(), mark, icon, status: response.status() });
}
await page.goto('http://127.0.0.1:3000/search');
assert.match(await page.title(), /Shopper$/);
console.log(JSON.stringify(results, null, 2));
await browser.close();
