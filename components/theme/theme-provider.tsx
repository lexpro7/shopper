'use client';

import { ThemeProvider as NextThemeProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="shopper-theme"
    >
      <BrowserThemeColor />
      {children}
    </NextThemeProvider>
  );
}

function BrowserThemeColor() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === 'dark' ? '#141816' : '#ffffff';
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', color));
  }, [resolvedTheme, pathname]);
  return null;
}
