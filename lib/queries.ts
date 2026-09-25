import { db } from './db';
import { currentUser } from './auth';
export const productInclude = {
  images: true,
  seller: {
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      avatar: true,
      rating: true,
      verified: true,
      role: true,
      status: true,
      location: true,
      createdAt: true,
      email: true,
    },
  },
  category: true,
  bids: true,
  reviews: true,
} as const;
export async function getProducts() {
  const user = await currentUser();
  return db.listing.findMany({
    where: {
      OR: [{ status: { in: ['Active', 'Sold'] } }, { sellerId: user?.id || '__anonymous__' }],
    },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  });
}
export function serialize<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}
