import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
await page
  .locator('main img')
  .evaluateAll((images) => images.forEach((image) => image.setAttribute('loading', 'eager')));
await page.waitForFunction(() =>
  Array.from(document.querySelectorAll('main img')).every(
    (image) => image.complete && image.naturalWidth > 0,
  ),
);
mkdirSync('artifacts', { recursive: true });
await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
await page.screenshot({ path: 'artifacts/home-desktop-viewport.png' });
console.log(
  JSON.stringify({
    images: await page
      .locator('main img')
      .evaluateAll((images) =>
        images.map((i) => ({
          src: i.getAttribute('src'),
          loaded: i.complete && i.naturalWidth > 0,
        })),
      ),
    errors,
  }),
);
await page.setViewportSize({ width: 375, height: 900 });
await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
await page.screenshot({ path: 'artifacts/home-mobile-viewport.png' });
await browser.close();
