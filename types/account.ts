import type { Prisma, User, Favorite, SavedSearch, Notification, Address } from '@prisma/client';
import type { Product } from '.';
export type OrderRecord = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        listing: {
          include: { images: true; seller: true; category: true; bids: true; reviews: true };
        };
      };
    };
  };
}>;
export type Account = {
  user: Omit<User, 'passwordHash'>;
  favorites: Favorite[];
  cart: Array<{ id: string; quantity: number; listingId: string; listing: Product }>;
  orders: OrderRecord[];
  offers: Prisma.OfferGetPayload<{
    include: { listing: true; user: { select: { firstName: true } } };
  }>[];
  bids: Prisma.AuctionBidGetPayload<{ include: { listing: true } }>[];
  messages: Prisma.ConversationGetPayload<{
    include: { listing: true; messages: { include: { user: { select: { firstName: true } } } } };
  }>[];
  reviews: Prisma.ReviewGetPayload<{
    include: { listing: true; user: { select: { firstName: true } } };
  }>[];
  notifications: Notification[];
  searches: SavedSearch[];
  addresses: Address[];
};
