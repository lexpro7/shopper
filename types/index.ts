import type { Prisma } from '@prisma/client';
import type { productInclude } from '@/lib/queries';
export type Product = Prisma.ListingGetPayload<{ include: typeof productInclude }>;
export type ProductDTO = Omit<
  Product,
  'createdAt' | 'updatedAt' | 'auctionEndsAt' | 'seller' | 'bids' | 'reviews'
> & {
  createdAt: string;
  updatedAt: string;
  auctionEndsAt: string | null;
  seller: Omit<Product['seller'], 'createdAt'> & { createdAt: string };
  bids: Array<Omit<Product['bids'][number], 'createdAt'> & { createdAt: string }>;
  reviews: Array<Omit<Product['reviews'][number], 'createdAt'> & { createdAt: string }>;
};
