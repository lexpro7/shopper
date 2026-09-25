import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  Leaf,
  Camera,
  Smartphone,
  Laptop,
  Gamepad2,
  Shirt,
  Watch,
  Armchair,
  Bike,
  Car,
  Disc3,
} from 'lucide-react';
import { getProducts, serialize } from '@/lib/queries';
import { db } from '@/lib/db';
import { ProductGrid } from '@/components/marketplace/product-card';
import { ImageFallback } from '@/components/marketplace/image-fallback';
import { SearchBar } from '@/components/layout/search-bar';
import { Button } from '@/components/ui/button';
import { Avatar, Rating } from '@/components/ui/primitives';
import { RecentProducts } from '@/components/marketplace/recent-products';
export const dynamic = 'force-dynamic';
const icons = [Camera, Smartphone, Laptop, Gamepad2, Shirt, Watch, Armchair, Bike, Car, Disc3];
export default async function Home() {
  const products = (await getProducts()).filter((p) => p.status === 'Active');
  const categories = await db.category.findMany();
  const sellers = await db.user.findMany({
    take: 4,
    select: { username: true, firstName: true, lastName: true, rating: true, location: true },
  });
  return (
    <div className="container home">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="green-dot" /> A FRESH PERSPECTIVE ON SECONDHAND
          </span>
          <h1>
            Good things.
            <br />
            <span>Next chapters.</span>
          </h1>
          <p>
            Discover something you’ll love. Pass on something
            <br className="desktop-only" /> you’ve loved. There’s a little magic in both.
          </p>
          <div className="hero-actions">
            <Button asChild>
              <Link href="/search">
                Explore the marketplace <ArrowUpRight size={18} />
              </Link>
            </Button>
            <Link href="/sell">
              Start selling <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-proof">
            <span className="mini-avatars">
              <i>LM</i>
              <i>NK</i>
              <i>TR</i>
            </span>
            <span>
              A community with good taste.
              <br />
              <b>And even better finds.</b>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image">
            <ImageFallback
              src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=90"
              alt="Warm living room with a vintage wooden sideboard"
              priority
            />
          </div>
          <span className="hero-stamp">
            LESS NEW.
            <br />
            MORE YOU.
            <Leaf size={19} />
          </span>
          <Link href="/category/home" className="hero-find">
            <span>
              <small>YOUR NEXT GREAT FIND</small>
              <b>A home with a little history</b>
              <span>Explore Home & Living</span>
            </span>
            <ArrowUpRight size={24} />
          </Link>
          <span className="hero-caption">PRE-LOVED. RE-DISCOVERED.</span>
        </div>
      </section>
      <div className="trust-row">
        <span>
          <ShieldCheck /> A little more peace of mind
        </span>
        <span>
          <Truck /> Across Switzerland, to your door
        </span>
        <span>
          <Leaf /> Better finds. Smaller footprint.
        </span>
      </div>
      <section className="section">
        <SectionHeading title="Find your kind of thing" href="/categories" link="All categories" />
        <div className="category-tiles">
          {categories.map((c, i) => {
            const Icon =
              icons[
                [
                  'electronics',
                  'phones',
                  'computers',
                  'gaming',
                  'fashion',
                  'watches',
                  'home',
                  'sports',
                  'cars',
                  'collectibles',
                ].indexOf(c.id)
              ] || icons[i];
            return (
              <Link key={c.id} href={`/category/${c.slug}`}>
                <span>
                  <Icon strokeWidth={1.4} />
                </span>
                <b>{c.name}</b>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="section">
        <SectionHeading
          eyebrow="A LITTLE INSPIRATION"
          title="Fresh finds, just for you"
          href="/search"
          link="Discover more"
        />
        <ProductGrid products={serialize(products.slice(0, 5))} />
      </section>
      <section className="editorial-banner">
        <div>
          <span className="eyebrow">THOUGHTFULLY FOUND. BEAUTIFULLY LIVED.</span>
          <h2>
            Make room for
            <br />a little character.
          </h2>
          <p>Objects with a story. A space that feels like you.</p>
          <Button asChild variant="outline">
            <Link href="/category/home">
              Find your home favourites <ArrowUpRight size={17} />
            </Link>
          </Button>
        </div>
        <div className="editorial-image">
          <ImageFallback
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85"
            alt="Thoughtfully furnished living space"
          />
        </div>
      </section>
      <section className="section">
        <SectionHeading
          eyebrow="THE CLOCK IS TICKING"
          title="Worth a bid"
          href="/search?type=Auction"
          link="All auctions"
        />
        <ProductGrid
          products={serialize(products.filter((p) => p.listingType === 'Auction').slice(0, 5))}
        />
      </section>
      <section className="section">
        <SectionHeading title="Just landed" href="/search?sort=newest" link="See what’s new" />
        <ProductGrid products={serialize(products.slice(6, 11))} />
      </section>
      <section className="section">
        <SectionHeading
          title="Good people. Great finds."
          href="/search"
          link="Meet your next find"
        />
        <div className="seller-grid">
          {sellers.map((s) => (
            <Link className="seller-card" key={s.username} href={`/seller/${s.username}`}>
              <Avatar name={`${s.firstName} ${s.lastName}`} />
              <div>
                <b>
                  {s.firstName} {s.lastName}
                </b>
                <p>{s.location} · Verified seller</p>
                <Rating value={s.rating} />
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading
          title="A few community favourites"
          href="/search?sort=popular"
          link="What’s trending"
        />
        <ProductGrid
          products={serialize([...products].sort((a, b) => b.views - a.views).slice(0, 5))}
        />
      </section>
      <RecentProducts products={serialize(products)} />
      <section className="sell-banner">
        <div>
          <span className="eyebrow">YOUR CUPBOARD HAS POTENTIAL</span>
          <h2>
            Someone’s next favourite
            <br />
            might already be yours.
          </h2>
          <p>Give it a fresh start. Listing your first item is easy.</p>
        </div>
        <Button asChild>
          <Link href="/sell">
            Let’s find it a new home <ArrowUpRight size={19} />
          </Link>
        </Button>
      </section>
      <div className="home-search">
        <h2>What will you discover next?</h2>
        <SearchBar large />
      </div>
    </div>
  );
}
function SectionHeading({
  title,
  eyebrow,
  href,
  link,
}: {
  title: string;
  eyebrow?: string;
  href: string;
  link: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      <Link href={href}>
        {link}
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}
