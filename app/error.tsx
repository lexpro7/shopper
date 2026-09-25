'use client';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container page">
      <div className="empty">
        <h1>A little interruption.</h1>
        <p>We couldn’t load this page. Check that the database is set up, then try again.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
