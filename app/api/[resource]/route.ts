import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser, sessionToken } from '@/lib/auth';
import { productInclude } from '@/lib/queries';
import { addressSchema, listingSchema, registrationSchema } from '@/lib/validation';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
type Context = { params: Promise<{ resource: string }> };
const idSchema = z.object({ id: z.string().min(1) });
export async function GET(req: NextRequest, { params }: Context) {
  const { resource } = await params;
  const user = await currentUser();
  if (resource === 'categories') return NextResponse.json(await db.category.findMany());
  if (resource === 'listings' || resource === 'search')
    return NextResponse.json(
      await db.listing.findMany({
        where: { status: 'Active', title: { contains: req.nextUrl.searchParams.get('q') || '' } },
        include: productInclude,
      }),
    );
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (resource === 'account') {
    const [
      favorites,
      cart,
      orders,
      offers,
      bids,
      messages,
      reviews,
      notifications,
      searches,
      addresses,
    ] = await Promise.all([
      db.favorite.findMany({ where: { userId: user.id } }),
      db.cartItem.findMany({
        where: { userId: user.id },
        include: { listing: { include: productInclude } },
      }),
      db.order.findMany({
        where: {
          OR: [{ buyerId: user.id }, { items: { some: { listing: { sellerId: user.id } } } }],
        },
        include: { items: { include: { listing: { include: productInclude } } } },
        orderBy: { createdAt: 'desc' },
      }),
      db.offer.findMany({
        where: { OR: [{ userId: user.id }, { listing: { sellerId: user.id } }] },
        include: { listing: true, user: { select: { firstName: true } } },
      }),
      db.auctionBid.findMany({ where: { userId: user.id }, include: { listing: true } }),
      db.conversation.findMany({
        where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
        include: {
          listing: true,
          messages: {
            include: { user: { select: { firstName: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      db.review.findMany({
        where: { OR: [{ userId: user.id }, { listing: { sellerId: user.id } }] },
        include: { listing: true, user: { select: { firstName: true } } },
      }),
      db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
      db.savedSearch.findMany({ where: { userId: user.id } }),
      db.address.findMany({ where: { userId: user.id } }),
    ]);
    const { passwordHash: _, ...safeUser } = user;
    void _;
    return NextResponse.json({
      user: safeUser,
      favorites,
      cart,
      orders,
      offers,
      bids,
      messages,
      reviews,
      notifications,
      searches,
      addresses,
    });
  }
  return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
}
export async function POST(req: NextRequest, { params }: Context) {
  try {
    if (
      req.headers.get('origin') &&
      new URL(req.headers.get('origin')!).host !== req.headers.get('host')
    )
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    const { resource } = await params;
    const body = await req.json();
    if (resource === 'auth') {
      if (body.action === 'logout') {
        (await cookies()).delete('seconda-session');
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'register') {
        const d = registrationSchema.parse(body);
        const salt = randomBytes(16).toString('hex');
        const user = await db.user.create({
          data: {
            email: d.email.toLowerCase(),
            username: `${d.firstName.toLowerCase()}-${randomBytes(3).toString('hex')}`,
            firstName: d.firstName,
            lastName: d.lastName,
            passwordHash: `${salt}:${scryptSync(d.password, salt, 64).toString('hex')}`,
          },
        });
        (await cookies()).set('seconda-session', sessionToken(user.id), {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 604800,
        });
        return NextResponse.json({ ok: true });
      }
      if (body.action === 'login') {
        const d = z.object({ email: z.email(), password: z.string() }).parse(body);
        const user = await db.user.findUnique({ where: { email: d.email.toLowerCase() } });
        const [salt, hash] = user?.passwordHash.split(':') || [];
        if (
          !user ||
          user.status !== 'Active' ||
          !hash ||
          !timingSafeEqual(scryptSync(d.password, salt, 64), Buffer.from(hash, 'hex'))
        )
          return NextResponse.json({ error: 'Email or password is incorrect' }, { status: 401 });
        (await cookies()).set('seconda-session', sessionToken(user.id), {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: 604800,
        });
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({
        ok: true,
        message: 'Demo only: no email or SMS is sent. Sign in with the demo credentials.',
      });
    }
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
    const result = await mutate(resource, body, user.id, user.role);
    return NextResponse.json(result ?? { ok: true });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') },
        { status: 400 },
      );
    const message = error instanceof Error ? error.message : 'Request failed';
    return NextResponse.json(
      { error: message.includes('Unique constraint') ? 'This record already exists.' : message },
      { status: 400 },
    );
  }
}
async function mutate(
  resource: string,
  body: Record<string, unknown>,
  userId: string,
  role: string,
) {
  const action = String(body.action || '');
  if (resource === 'favorites') {
    const { id } = idSchema.parse(body);
    const existing = await db.favorite.findUnique({
      where: { userId_listingId: { userId, listingId: id } },
    });
    return existing
      ? db.favorite.delete({ where: { id: existing.id } })
      : db.favorite.create({ data: { userId, listingId: id } });
  }
  if (resource === 'cart') {
    const d = z.object({ id: z.string(), quantity: z.number().int().min(0).max(100) }).parse(body);
    if (d.quantity === 0) return db.cartItem.deleteMany({ where: { userId, listingId: d.id } });
    const listing = await db.listing.findUniqueOrThrow({ where: { id: d.id } });
    if (
      listing.status !== 'Active' ||
      listing.listingType === 'Auction' ||
      listing.quantity < d.quantity
    )
      throw Error('This quantity is unavailable.');
    return db.cartItem.upsert({
      where: { userId_listingId: { userId, listingId: d.id } },
      update: { quantity: d.quantity },
      create: { userId, listingId: d.id, quantity: d.quantity },
    });
  }
  if (resource === 'orders') {
    const d = addressSchema.parse(body);
    return db.$transaction(async (tx) => {
      const cart = await tx.cartItem.findMany({ where: { userId }, include: { listing: true } });
      if (!cart.length) throw Error('Your bag is empty.');
      const subtotal = cart.reduce((a, c) => a + c.quantity * c.listing.price, 0);
      const shipping = d.delivery === 'pickup' ? 0 : 790;
      const discount = d.promo === 'HELLO10' ? Math.round(subtotal * 0.1) : 0;
      if (cart.some((c) => (d.delivery === 'pickup' ? !c.listing.pickup : !c.listing.delivery)))
        throw Error('One or more items do not support the selected delivery method.');
      for (const c of cart) {
        const updated = await tx.listing.updateMany({
          where: {
            id: c.listingId,
            status: 'Active',
            listingType: 'Fixed price',
            quantity: { gte: c.quantity },
          },
          data: { quantity: { decrement: c.quantity } },
        });
        if (updated.count !== 1) throw Error(`${c.listing.title} is no longer available.`);
        await tx.listing.updateMany({
          where: { id: c.listingId, quantity: 0 },
          data: { status: 'Sold' },
        });
      }
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          total: subtotal + shipping - discount,
          shipping,
          discount,
          address: `${d.firstName} ${d.lastName}, ${d.street} ${d.apartment || ''}, ${d.postalCode} ${d.city}, ${d.country}`,
          paymentMethod: `${d.payment} (demo)`,
          items: {
            create: cart.map((c) => ({
              listingId: c.listingId,
              quantity: c.quantity,
              price: c.listing.price,
            })),
          },
        },
      });
      await tx.cartItem.deleteMany({ where: { userId } });
      await tx.notification.create({
        data: {
          userId,
          type: 'purchase',
          title: 'Your order is confirmed',
          text: `Order ${order.id} has been paid in demo mode.`,
        },
      });
      return order;
    });
  }
  if (resource === 'listings') {
    if (action && action !== 'save') {
      const { id } = idSchema.parse(body);
      const listing = await db.listing.findFirstOrThrow({ where: { id, sellerId: userId } });
      if (action === 'duplicate') {
        const { id: _, slug, createdAt, updatedAt, ...data } = listing;
        void _;
        void createdAt;
        void updatedAt;
        return db.listing.create({
          data: {
            ...data,
            slug: `${slug}-${Date.now()}`,
            title: `${data.title} (copy)`,
            status: 'Draft',
          },
        });
      }
      const states: Record<string, string> = {
        pause: 'Draft',
        archive: 'Archived',
        delete: 'Archived',
        sold: 'Sold',
        activate: 'Active',
      };
      if (action === 'promote')
        return db.listing.update({ where: { id }, data: { promoted: true } });
      if (!states[action]) throw Error('Unknown action');
      return db.listing.update({ where: { id }, data: { status: states[action] } });
    }
    const d = listingSchema.parse(body);
    const { image, duration, ...data } = d;
    const auctionEndsAt =
      d.listingType === 'Auction' ? new Date(Date.now() + duration * 86400000) : null;
    if (body.id) {
      const existing = await db.listing.findFirstOrThrow({
        where: { id: String(body.id), sellerId: userId },
      });
      return db.listing.update({
        where: { id: existing.id },
        data: { ...data, auctionEndsAt, images: { deleteMany: {}, create: { url: image } } },
      });
    }
    return db.listing.create({
      data: {
        ...data,
        sellerId: userId,
        slug: `${d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
        startingBid: d.price,
        currentBid: d.listingType === 'Auction' ? d.price : 0,
        auctionEndsAt,
        images: { create: { url: image } },
      },
    });
  }
  if (resource === 'bids') {
    const d = z.object({ id: z.string(), amount: z.number().int().positive() }).parse(body);
    return db.$transaction(async (tx) => {
      const l = await tx.listing.findUniqueOrThrow({ where: { id: d.id } });
      if (l.sellerId === userId) throw Error('You cannot bid on your own listing.');
      if (
        l.status !== 'Active' ||
        l.listingType !== 'Auction' ||
        !l.auctionEndsAt ||
        l.auctionEndsAt < new Date()
      )
        throw Error('This auction has ended.');
      if (d.amount < l.currentBid + l.minimumBid)
        throw Error('Your bid is below the minimum next bid.');
      await tx.listing.update({ where: { id: d.id }, data: { currentBid: d.amount } });
      return tx.auctionBid.create({ data: { listingId: d.id, userId, amount: d.amount } });
    });
  }
  if (resource === 'offers') {
    if (action) {
      const offer = await db.offer.findFirstOrThrow({
        where: { id: String(body.id), OR: [{ listing: { sellerId: userId } }, { userId }] },
        include: { listing: true },
      });
      z.enum(['accept', 'decline', 'counter']).parse(action);
      const isSeller = offer.listing.sellerId === userId;
      if (!(
        (offer.status === 'Pending' && isSeller) ||
        (offer.status === 'Countered' && !isSeller)
      ))
        throw Error('This offer is closed or waiting for the other person.');
      return db.offer.update({
        where: { id: offer.id },
        data: {
          status:
            action === 'accept'
              ? 'Accepted'
              : action === 'decline'
                ? 'Declined'
                : isSeller
                  ? 'Countered'
                  : 'Pending',
          ...(action === 'counter'
            ? { amount: z.number().int().positive().parse(body.amount) }
            : {}),
        },
      });
    }
    const d = z.object({ id: z.string(), amount: z.number().int().positive() }).parse(body);
    const l = await db.listing.findUniqueOrThrow({ where: { id: d.id } });
    if (!l.allowOffers || l.status !== 'Active' || l.sellerId === userId)
      throw Error('Offers are unavailable for this listing.');
    return db.offer.create({ data: { userId, listingId: d.id, amount: d.amount } });
  }
  if (resource === 'messages') {
    if (action === 'start') {
      const l = await db.listing.findUniqueOrThrow({ where: { id: String(body.id) } });
      return db.conversation.upsert({
        where: {
          buyerId_sellerId_listingId: { buyerId: userId, sellerId: l.sellerId, listingId: l.id },
        },
        update: {},
        create: { buyerId: userId, sellerId: l.sellerId, listingId: l.id },
      });
    }
    const c = await db.conversation.findFirstOrThrow({
      where: { id: String(body.id), OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    if (action === 'block')
      return db.conversation.update({ where: { id: c.id }, data: { blocked: !c.blocked } });
    if (c.blocked) throw Error('This conversation is blocked.');
    return db.message.create({
      data: { conversationId: c.id, userId, text: z.string().min(1).max(2000).parse(body.text) },
    });
  }
  if (resource === 'reviews') {
    const d = z
      .object({
        id: z.string(),
        rating: z.number().int().min(1).max(5),
        text: z.string().min(10).max(2000),
      })
      .parse(body);
    const purchase = await db.orderItem.findFirst({
      where: { listingId: d.id, order: { buyerId: userId } },
    });
    if (!purchase) throw Error('You can review items you have purchased.');
    return db.review.create({ data: { listingId: d.id, userId, rating: d.rating, text: d.text } });
  }
  if (resource === 'notifications')
    return db.notification.updateMany({
      where: { userId, ...(body.id ? { id: String(body.id) } : {}) },
      data: { read: true },
    });
  if (resource === 'searches') {
    if (action === 'delete')
      return db.savedSearch.deleteMany({ where: { id: String(body.id), userId } });
    if (action === 'toggle') {
      const s = await db.savedSearch.findFirstOrThrow({ where: { id: String(body.id), userId } });
      return db.savedSearch.update({ where: { id: s.id }, data: { notify: !s.notify } });
    }
    const d = z.object({ name: z.string().min(1), query: z.string().max(2000) }).parse(body);
    return db.savedSearch.create({ data: { ...d, userId } });
  }
  if (resource === 'addresses') {
    if (action === 'delete')
      return db.address.deleteMany({ where: { id: String(body.id), userId } });
    const d = z
      .object({
        name: z.string().min(2),
        street: z.string().min(3),
        city: z.string().min(2),
        postalCode: z.string().min(3),
        country: z.string().min(2),
        phone: z.string().min(7),
      })
      .parse(body);
    return db.address.create({ data: { ...d, userId } });
  }
  if (resource === 'settings') {
    const d = z
      .object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        location: z.string().min(2),
      })
      .parse(body);
    await db.user.update({ where: { id: userId }, data: d });
    return { ok: true };
  }
  if (resource === 'security') {
    if (action === 'password') {
      const d = z.object({ oldPassword: z.string(), password: z.string().min(10) }).parse(body);
      const u = await db.user.findUniqueOrThrow({ where: { id: userId } });
      const [salt, hash] = u.passwordHash.split(':');
      if (scryptSync(d.oldPassword, salt, 64).toString('hex') !== hash)
        throw Error('Current password is incorrect.');
      const nextSalt = randomBytes(16).toString('hex');
      await db.user.update({
        where: { id: userId },
        data: {
          passwordHash: `${nextSalt}:${scryptSync(d.password, nextSalt, 64).toString('hex')}`,
        },
      });
      return { ok: true };
    }
    return {
      ok: true,
      message: 'Demo preference saved locally. No external verification was performed.',
    };
  }
  if (resource === 'reports') {
    const d = z
      .object({ target: z.string().min(1), reason: z.string().min(10).max(2000) })
      .parse(body);
    return db.report.create({ data: { ...d, userId } });
  }
  if (resource === 'disputes') {
    const d = z.object({ id: z.string(), reason: z.string().min(10) }).parse(body);
    await db.order.findFirstOrThrow({ where: { id: d.id, buyerId: userId } });
    return db.dispute.create({ data: { orderId: d.id, reason: d.reason } });
  }
  if (resource === 'order-status') {
    const { id } = idSchema.parse(body);
    const o = await db.order.findFirstOrThrow({
      where: {
        id,
        OR: [{ buyerId: userId }, { items: { some: { listing: { sellerId: userId } } } }],
      },
    });
    const status = z.enum(['Shipped', 'Returned', 'Cancelled', 'Completed']).parse(body.status);
    if (status === 'Shipped' && o.buyerId === userId)
      throw Error('Only the seller can mark a shipment.');
    return db.order.update({ where: { id }, data: { status } });
  }
  if (resource === 'admin') {
    if (role !== 'ADMIN') throw Error('Administrator access required');
    const { id } = idSchema.parse(body);
    if (body.entity === 'listings')
      return db.listing.update({
        where: { id },
        data: { status: z.enum(['Active', 'Rejected', 'Hidden']).parse(body.status) },
      });
    if (body.entity === 'users') {
      await db.user.update({
        where: { id },
        data: { status: z.enum(['Active', 'Suspended']).parse(body.status) },
      });
      return { ok: true };
    }
    if (body.entity === 'reports')
      return db.report.update({ where: { id }, data: { status: 'Resolved' } });
    if (body.entity === 'disputes')
      return db.dispute.update({ where: { id }, data: { status: 'Resolved' } });
    throw Error('Unsupported moderation action');
  }
  throw Error('Unknown resource');
}
