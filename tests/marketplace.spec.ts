import { test, expect } from '@playwright/test';
test('catalog filters, sort, favorites and listing navigation', async ({ page, request }) => {
  const available = (await (await request.get('/api/listings')).json()) as Array<{
    title: string;
    categoryId: string;
    price: number;
  }>;
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Good things. Next chapters.' })).toBeVisible();
  await page.goto('/search?q=Sony');
  await expect(page.locator('.product-card')).toHaveCount(
    available.filter((p) => p.title.includes('Sony')).length,
  );
  await page.getByLabel('Sort listings').selectOption('low');
  await expect(page).toHaveURL(/sort=low/);
  await page.getByRole('button', { name: 'List view', exact: true }).click();
  await expect(page.locator('.list-view')).toBeVisible();
  await page.goto('/search?category=phones&min=400');
  await expect(page.locator('.product-card')).toHaveCount(
    available.filter((p) => p.categoryId === 'phones' && p.price >= 40000).length,
  );
  await page.goto('/search?q=zzzz-no-match');
  await expect(page.getByRole('heading', { name: 'No finds this time' })).toBeVisible();
  await page.goto('/listing/sony-wh-1000xm5-headphones');
  await expect(
    page.getByRole('heading', { name: 'Sony WH-1000XM5 headphones', exact: true }),
  ).toBeVisible();
  const favorite = page.getByRole('button', { name: 'Toggle favorite' });
  const before = await favorite.innerText();
  await favorite.click();
  await expect(favorite).not.toHaveText(before);
  await favorite.click();
  await page.getByRole('tab', { name: 'Specifications', exact: true }).click();
  await expect(page.locator('.specs')).toContainText('Sony');
});
test('cart quantity, promo and complete demo checkout', async ({ page, request }) => {
  const account = await (await request.get('/api/account')).json();
  for (const c of account.cart)
    await request.post('/api/cart', { data: { id: c.listingId, quantity: 0 } });
  const fixtureResponse = await request.post('/api/listings', {
    data: {
      title: `E2E checkout fixture ${Date.now()}`,
      description: 'A dedicated demonstration fixture for the automated checkout scenario.',
      categoryId: 'electronics',
      condition: 'Very good',
      brand: 'Demo',
      price: 19500,
      quantity: 3,
      location: 'Zürich',
      delivery: true,
      pickup: true,
      listingType: 'Fixed price',
      allowOffers: true,
      image:
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85',
    },
  });
  expect(fixtureResponse.ok()).toBeTruthy();
  const fixture = await fixtureResponse.json();
  await page.goto(`/listing/${fixture.slug}`);
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  await expect(page.getByText('Added to your bag', { exact: true })).toBeVisible();
  await page.goto('/cart');
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await page.getByLabel('Increase quantity').click();
  await expect(page.locator('.quantity')).toContainText('2');
  await page.getByLabel('Decrease quantity').click();
  await page.getByLabel('Promo code').fill('HELLO10');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('.summary')).toContainText('HELLO10');
  await page.getByRole('link', { name: 'Continue to checkout' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Review & confirm' }).click();
  await page.getByRole('button', { name: 'Confirm demo payment', exact: true }).click();
  await expect(page).toHaveURL(/\/order\/success\//);
  await expect(page.getByRole('heading', { name: 'A very good choice.' })).toBeVisible();
  const orderId = page.url().split('/').pop()!;
  await page.getByRole('link', { name: 'View order', exact: true }).click();
  await expect(page.locator('main')).toContainText(orderId);
  await request.post('/api/listings', { data: { id: fixture.id, action: 'archive' } });
});
test('registration, login and ownership checks', async ({ page, request }) => {
  const email = `e2e-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.getByLabel('First name', { exact: true }).fill('Demo');
  await page.getByLabel('Last name', { exact: true }).fill('Tester');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('TestSeconda2026!');
  await page.getByLabel('Confirm password', { exact: true }).fill('TestSeconda2026!');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/verify-email/);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Good to see you, Demo.' })).toBeVisible();
  const unauthorized = await page.request.post('/api/listings', {
    data: { id: 'item-2', action: 'archive' },
  });
  expect(unauthorized.status()).toBe(400);
  const admin = await page.request.post('/api/admin', {
    data: { id: 'item-2', entity: 'listings', status: 'Hidden' },
  });
  expect(admin.status()).toBe(400);
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText('incorrect');
  await page.getByLabel('Password', { exact: true }).fill('TestSeconda2026!');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/profile$/);
  const invalidQuantity = await request.post('/api/cart', {
    data: { id: 'item-1', quantity: 101 },
  });
  expect(invalidQuantity.status()).toBe(400);
  const foreignOrigin = await request.post('/api/cart', {
    headers: { origin: 'https://unrelated.example' },
    data: { id: 'item-1', quantity: 1 },
  });
  expect(foreignOrigin.status()).toBe(403);
});
test('messages, offers, bids and validation persist', async ({ page, request }) => {
  await page.goto('/profile/messages?conversation=chat-demo');
  const message = `A friendly test hello ${Date.now()}`;
  await page.getByLabel('Message', { exact: true }).fill(message);
  await page.getByLabel('Send message').click();
  await expect(page.locator('.chat-messages')).toContainText(message);
  await page.goto('/listing/fujifilm-x-t4-with-35mm-lens');
  await page.getByRole('button', { name: 'Place a bid', exact: true }).click();
  const input = page.getByLabel('Your amount (CHF)');
  const amount = Number(await input.inputValue());
  await input.fill(String(amount));
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const invalid = await request.post('/api/bids', { data: { id: 'item-2', amount: 100 } });
  expect(invalid.status()).toBe(400);
  await page.getByRole('button', { name: 'Make an offer', exact: true }).click();
  await page.getByLabel('Your amount (CHF)').fill('800');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/profile/offers');
  await page.getByRole('tab', { name: 'Sent', exact: true }).click();
  await expect(page.locator('main')).toContainText('Fujifilm X-T4');
  const listings = await (await request.get('/api/listings')).json();
  expect(JSON.stringify(listings)).not.toContain('passwordHash');
});
test('publish, edit and archive a listing through seller tools', async ({ page }) => {
  const title = `Test camera ${Date.now()}`;
  await page.goto('/sell');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page
    .getByLabel('Description', { exact: true })
    .fill('A carefully maintained test camera with original accessories and packaging.');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Brand', { exact: true }).fill('Shopper');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Price (CHF)').fill('125');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Publish listing', exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  const slug = page.url().split('/').pop();
  await page.goto(`/listing/${slug}/edit`);
  await expect(page.getByRole('heading', { name: 'A little refresh.' })).toBeVisible();
  await page.goto('/profile/listings');
  await page.getByLabel(`Actions for ${title}`).selectOption('archive');
  await expect(page.getByLabel(`Actions for ${title}`)).toHaveCount(0);
});
test('all required routes render without application errors', async ({ page }) => {
  const routes = [
    '/categories',
    '/category/electronics',
    '/seller/lea',
    '/profile',
    '/profile/purchases',
    '/profile/sales',
    '/profile/listings',
    '/profile/favorites',
    '/profile/auctions',
    '/profile/reviews',
    '/profile/saved-searches',
    '/profile/addresses',
    '/profile/payments',
    '/profile/notifications',
    '/profile/settings',
    '/profile/security',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/help',
    '/help/buying',
    '/help/selling',
    '/trust',
    '/buyer-protection',
    '/seller-protection',
    '/report',
    '/disputes',
    '/about',
    '/how-it-works',
    '/fees',
    '/contact',
    '/terms',
    '/privacy',
    '/cookies',
    '/imprint',
    '/admin',
    '/admin/users',
    '/admin/listings',
    '/admin/orders',
    '/admin/payments',
    '/admin/categories',
    '/admin/reports',
    '/admin/disputes',
    '/admin/reviews',
    '/admin/promotions',
    '/admin/support',
    '/admin/analytics',
    '/admin/settings',
  ];
  for (const path of routes) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main h1').first(), path).toBeVisible();
    await expect(page.getByText('A little interruption.', { exact: true })).toHaveCount(0);
  }
});
test('responsive screens have no horizontal overflow at required widths', async ({ page }) => {
  for (const width of [375, 430, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      '/',
      '/search',
      '/listing/sony-wh-1000xm5-headphones',
      '/profile',
      '/profile/messages',
      '/sell',
      '/admin',
    ]) {
      await page.goto(route);
      await expect(page.locator('main h1').first()).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${route} at ${width}px`).toBe(false);
    }
    await page.goto('/');
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
  }
});
