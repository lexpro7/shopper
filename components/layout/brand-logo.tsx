import Image from 'next/image';
import Link from 'next/link';

export function BrandLogo() {
  return (
    <Link href="/" className="logo brand-logo" aria-label="Shopper — home">
      <Image
        src="/brand/shopper-logo.png"
        alt=""
        width={64}
        height={64}
        className="brand-mark"
        priority
        unoptimized
      />
      <span className="brand-wordmark">Shopper</span>
    </Link>
  );
}
