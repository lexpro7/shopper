import Link from 'next/link';
import { RegionPicker } from './region-picker';
import { BrandLogo } from './brand-logo';
export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <BrandLogo />
          <p>
            Great finds. Fresh starts.
            <br />A marketplace for the next chapter.
          </p>
          <span className="demo-tag">Demo marketplace · No real transactions</span>
        </div>
        {[
          [
            'Discover',
            ['Marketplace', '/search'],
            ['Categories', '/categories'],
            ['How it works', '/how-it-works'],
          ],
          [
            'Buy & sell',
            ['Start selling', '/sell'],
            ['Buyer protection', '/buyer-protection'],
            ['Seller protection', '/seller-protection'],
            ['Fees', '/fees'],
          ],
          [
            'Here to help',
            ['Help center', '/help'],
            ['Trust & safety', '/trust'],
            ['Contact us', '/contact'],
            ['About Shopper', '/about'],
          ],
        ].map(([heading, ...links]) => (
          <div key={heading as string}>
            <h4>{heading as string}</h4>
            {(links as string[][]).map(([text, href]) => (
              <Link key={href} href={href}>
                {text}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Shopper. Made for a second life.</span>
        <div>
          {['terms', 'privacy', 'cookies', 'imprint'].map((s) => (
            <Link key={s} href={`/${s}`}>
              {s[0].toUpperCase() + s.slice(1)}
            </Link>
          ))}
          <RegionPicker />
        </div>
      </div>
    </footer>
  );
}
