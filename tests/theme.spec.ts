import { test, expect } from '@playwright/test';

test('System, manual overrides, persistence, settings and keyboard menu', async ({
  page,
  context,
}) => {
  const hydrationErrors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && /hydration|hydrated|did not match/i.test(m.text()))
      hydrationErrors.push(m.text());
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Choose theme', exact: true }).click();
  await expect(page.getByRole('menuitemradio', { name: 'System', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.getByRole('menuitemradio', { name: 'Light', exact: true }).click();
  await expect(page.locator('html')).toHaveClass(/light/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('shopper-theme'))).toBe('light');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/light/);
  await expect(page.getByRole('button', { name: 'Choose theme' })).toBeEnabled();
  await page.getByRole('button', { name: 'Choose theme' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: 'Dark', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('meta[name="theme-color"]').first()).toHaveAttribute(
    'content',
    '#141816',
  );
  await page.goto('/profile/settings');
  await expect(page.getByRole('heading', { name: 'Appearance', exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'System', exact: true }).check();
  await expect(page.locator('html')).toHaveClass(/light/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveClass(/light/);
  const other = await context.newPage();
  await other.goto('/');
  await expect(other.getByRole('button', { name: 'Choose theme' })).toBeEnabled();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await expect(other.locator('html')).toHaveClass(/dark/);
  await other.close();
  expect(hydrationErrors).toEqual([]);
});

test('saved dark and system dark are applied before hydration', async ({ browser }) => {
  for (const saved of [null, 'dark']) {
    const context = await browser.newContext({ colorScheme: saved ? 'light' : 'dark' });
    if (saved) await context.addInitScript(() => localStorage.setItem('shopper-theme', 'dark'));
    const page = await context.newPage();
    // Delaying external bundles leaves the inline next-themes bootstrap responsible for first paint.
    await page.route('**/_next/static/**/*.js', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('main h1').waitFor();
    await expect(page.locator('html')).toHaveClass(/dark/);
    expect(await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgb(20, 24, 22)',
    );
    await context.close();
  }
});

test('light and dark surfaces, images, dialogs and responsive screens', async ({
  page,
  request,
}) => {
  test.setTimeout(240000);
  const issues: string[] = [];
  page.on('pageerror', (error) => issues.push(error.message));
  const account = await (await request.get('/api/account')).json();
  const products = await (await request.get('/api/listings')).json();
  const product = products.find((p: { listingType: string }) => p.listingType === 'Fixed price');
  // Read-only fixture shows cart/checkout surfaces without modifying the user's actual bag.
  await page.route('**/api/account', (route) =>
    route.fulfill({
      json: {
        ...account,
        cart: [{ id: 'theme-preview', listingId: product.id, quantity: 1, listing: product }],
      },
    }),
  );
  for (const theme of ['light', 'dark']) {
    await page.goto('/');
    await page.getByRole('button', { name: 'Choose theme' }).click();
    await page
      .getByRole('menuitemradio', { name: theme === 'dark' ? 'Dark' : 'Light', exact: true })
      .click();
    for (const width of [375, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of [
        '/',
        '/search',
        '/listing/sony-wh-1000xm5-headphones',
        '/cart',
        '/checkout',
        '/profile/settings',
        '/profile/messages',
        '/profile/notifications',
        '/admin',
        '/admin/users',
        '/login',
        '/sell',
      ]) {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('main h1:visible').first()).toBeVisible();
        await expect(page.locator('html')).toHaveClass(new RegExp(theme));
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          `${theme} ${width} ${path}`,
        ).toBe(false);
        expect(
          await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor),
        ).toBe(theme === 'dark' ? 'rgb(20, 24, 22)' : 'rgb(255, 255, 255)');
        expect(
          await page
            .locator('.product-photo img,.gallery-main img,.brand-mark')
            .evaluateAll((images) =>
              images.every((img) => getComputedStyle(img).filter === 'none'),
            ),
        ).toBe(true);
      }
      await page.goto('/');
      await page.screenshot({ path: `artifacts/theme-${theme}-${width}.png` });
    }
    await page.goto('/listing/sony-wh-1000xm5-headphones');
    await page.getByRole('button', { name: 'Report this listing' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(
      await page.getByRole('dialog').evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe(theme === 'dark' ? 'rgb(41, 49, 43)' : 'rgb(255, 255, 255)');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto('/search');
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Choose theme' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shopping bag', exact: true })).toBeVisible();
  }
  expect(issues).toEqual([]);
});
