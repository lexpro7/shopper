import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme.css';
import { Provider } from '@/components/marketplace/provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeProvider } from '@/components/theme/theme-provider';
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#141816' },
  ],
};
export const metadata: Metadata = {
  title: { default: 'Shopper — Buy & Sell Marketplace', template: '%s | Shopper' },
  description:
    'Shopper is a modern marketplace for buying and selling products securely and easily.',
  openGraph: {
    title: 'Shopper — Buy & Sell Marketplace',
    description:
      'Shopper is a modern marketplace for buying and selling products securely and easily.',
    siteName: 'Shopper',
    type: 'website',
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
        <Provider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
