import { PrismaClient } from '@prisma/client';
import { categories, products } from '../data/seed-data';
import { scryptSync } from 'node:crypto';
const db = new PrismaClient();
async function main() {
  for (const [id, name, subcategories] of categories)
    await db.category.upsert({
      where: { id },
      update: {},
      create: { id, slug: id, name, subcategories },
    });
  const names = [
    ['alex', 'Alex', 'Martin', 'Zürich'],
    ['lea', 'Léa', 'Dubois', 'Lausanne'],
    ['marco', 'Marco', 'Rossi', 'Lugano'],
    ['nina', 'Nina', 'Keller', 'Bern'],
    ['tom', 'Tom', 'Weber', 'Basel'],
  ];
  for (const [id, firstName, lastName, location] of names)
    await db.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        username: id,
        email: `${id}@example.com`,
        firstName,
        lastName,
        location,
        verified: true,
        role: id === 'alex' ? 'ADMIN' : 'USER',
        passwordHash: `demo:${scryptSync('Seconda2026!', 'demo', 64).toString('hex')}`,
      },
    });
  for (let i = 0; i < products.length; i++) {
    const [title, categoryId, price, brand, photo] = products[i];
    const id = `item-${i + 1}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-$/, '');
    await db.listing.upsert({
      where: { id },
      update: {},
      create: {
        id,
        slug,
        title,
        categoryId,
        brand,
        price: price * 100,
        originalPrice: i % 3 === 0 ? Math.round(price * 135) : null,
        description: `A carefully looked-after ${title}. Fully tested and ready for its next chapter. ${i % 2 === 0 ? 'Includes the original packaging and accessories.' : 'Light signs of everyday use, as shown in the photos.'} Collection is welcome, or I can pack it securely for delivery across Switzerland. This is a demonstration listing; no real item is offered for sale.`,
        condition: ['Very good', 'Like new', 'Good', 'New'][i % 4],
        sellerId: names[i % 5][0],
        location: names[i % 5][3],
        quantity: i % 5 === 0 ? 3 : 1,
        subcategory: categories.find((c) => c[0] === categoryId)![2].split(',')[0],
        model: title.split(' ').slice(1, 4).join(' '),
        specifications: JSON.stringify({
          Brand: brand,
          Included: 'Original accessories',
          Warranty: 'Seller description applies',
        }),
        listingType: i % 6 === 1 ? 'Auction' : 'Fixed price',
        startingBid: i % 6 === 1 ? price * 80 : 0,
        currentBid: i % 6 === 1 ? price * 100 : 0,
        auctionEndsAt: i % 6 === 1 ? new Date(Date.now() + (i + 2) * 3600000) : null,
        views: 120 + i * 47,
        createdAt: new Date(Date.now() - i * 3600000),
        images: {
          create: [
            {
              url: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`,
              position: 0,
            },
            {
              url: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1200&q=85`,
              position: 1,
            },
          ],
        },
      },
    });
  }
  await db.address.upsert({
    where: { id: 'address-demo' },
    update: {},
    create: {
      id: 'address-demo',
      userId: 'alex',
      name: 'Alex Martin',
      street: 'Limmatstrasse 42',
      city: 'Zürich',
      postalCode: '8005',
      phone: '+41 79 123 45 67',
    },
  });
  for (const n of [2, 5, 8])
    await db.favorite.upsert({
      where: { userId_listingId: { userId: 'alex', listingId: `item-${n}` } },
      update: {},
      create: { userId: 'alex', listingId: `item-${n}` },
    });
  await db.order.upsert({
    where: { id: 'SC-2026-1042' },
    update: {},
    create: {
      id: 'SC-2026-1042',
      buyerId: 'alex',
      total: 15290,
      status: 'Shipped',
      address: 'Alex Martin, Limmatstrasse 42, 8005 Zürich, Switzerland',
      paymentMethod: 'TWINT (demo)',
      items: { create: { listingId: 'item-5', quantity: 1, price: 14500 } },
    },
  });
  await db.order.upsert({
    where: { id: 'SC-2026-1036' },
    update: {},
    create: {
      id: 'SC-2026-1036',
      buyerId: 'lea',
      total: 20290,
      status: 'Paid',
      address: 'Léa Dubois, Rue Centrale 12, Lausanne',
      paymentMethod: 'PayPal (demo)',
      items: { create: { listingId: 'item-1', quantity: 1, price: 19500 } },
    },
  });
  await db.conversation.upsert({
    where: { id: 'chat-demo' },
    update: {},
    create: {
      id: 'chat-demo',
      buyerId: 'alex',
      sellerId: 'lea',
      listingId: 'item-2',
      messages: {
        create: [
          { userId: 'alex', text: 'Hi Léa! Is the lens included with the camera?' },
          {
            userId: 'lea',
            text: 'Hi Alex! Yes, the 35mm lens, battery and original box are all included. Happy to answer any questions.',
          },
        ],
      },
    },
  });
  await db.offer.upsert({
    where: { id: 'offer-demo' },
    update: {},
    create: { id: 'offer-demo', userId: 'lea', listingId: 'item-1', amount: 18000 },
  });
  await db.auctionBid.upsert({
    where: { id: 'bid-demo' },
    update: {},
    create: { id: 'bid-demo', userId: 'alex', listingId: 'item-2', amount: 89000 },
  });
  for (let i = 0; i < 8; i++)
    await db.review.upsert({
      where: { id: `review-${i}` },
      update: {},
      create: {
        id: `review-${i}`,
        userId: names[(i + 1) % 5][0],
        listingId: `item-${i + 1}`,
        rating: i % 3 === 0 ? 4 : 5,
        text: [
          'Exactly as described. Carefully packed and arrived quickly. Thank you!',
          'Lovely seller, easy communication and a smooth collection.',
          'Great condition and a fair price. Would happily buy again.',
        ][i % 3],
      },
    });
  for (const [i, type] of [
    'message',
    'sale',
    'purchase',
    'bid',
    'auction',
    'offer',
    'price drop',
    'saved search',
    'review',
    'system',
  ].entries())
    await db.notification.upsert({
      where: { id: `notice-${i}` },
      update: {},
      create: {
        id: `notice-${i}`,
        userId: 'alex',
        type,
        title: [
          'You have a new message',
          'Your headphones found a new home',
          'Your order is on its way',
          'You’re the highest bidder',
          'An auction ends today',
          'A new offer to consider',
          'A favourite is now less',
          'Fresh finds for your search',
          'A buyer left you a review',
          'Welcome to Shopper',
        ][i],
        text: 'Visit your account to see the details.',
        read: i > 3,
      },
    });
  await db.savedSearch.upsert({
    where: { id: 'search-demo' },
    update: {},
    create: { id: 'search-demo', userId: 'alex', name: 'Fujifilm cameras', query: 'q=Fujifilm' },
  });
  await db.report.upsert({
    where: { id: 'report-demo' },
    update: {},
    create: {
      id: 'report-demo',
      userId: 'lea',
      target: 'item-28',
      reason: 'Please review the description for accuracy.',
    },
  });
  console.log('Seed ready: 10 categories, 32 listings, 5 users and demo activity.');
}
main().finally(() => db.$disconnect());
