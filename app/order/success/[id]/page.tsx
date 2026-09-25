import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { money } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const order = await db.order.findFirst({
    where: { id, buyerId: user?.id || 'none' },
    include: { items: { include: { listing: true } } },
  });
  if (!order) notFound();
  return (
    <div className="container page success-page">
      <div className="success-icon">
        <Check size={36} />
      </div>
      <span className="eyebrow">HERE’S TO NEW CHAPTERS</span>
      <h1>A very good choice.</h1>
      <p>Your demo order is confirmed. No real money was charged.</p>
      <div className="panel">
        <h3>Order {order.id}</h3>
        {order.items.map((i) => (
          <div className="summary-product" key={i.id}>
            <span>
              {i.listing.title} × {i.quantity}
            </span>
            <b>{money(i.price * i.quantity)}</b>
          </div>
        ))}
        <div className="summary-total">
          Total <b>{money(order.total)}</b>
        </div>
        <p>
          <b>Delivery to</b>
          <br />
          {order.address}
        </p>
        <p>
          <b>Payment</b>
          <br />
          {order.paymentMethod}
        </p>
        <p className="muted">
          Tracking will appear here when the seller marks the order as shipped. Demo shipments are
          not sent.
        </p>
      </div>
      <div className="inline-actions">
        <Button asChild>
          <Link href={`/profile/purchases/${order.id}`}>
            View order <ArrowRight size={16} />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Keep exploring</Link>
        </Button>
      </div>
    </div>
  );
}
