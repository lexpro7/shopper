'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { articles, helpTopics, faqs } from '@/data/content';
import { useMarket } from './provider';
import { Button } from '../ui/button';
import { Breadcrumbs, Field, Input, Select, Textarea } from '../ui/primitives';
import { titleCase } from '@/lib/utils';
export function ContentPage({ slug, topic }: { slug: string; topic?: string }) {
  const [q, setQ] = useState(''),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    { act } = useMarket();
  if (slug === 'help')
    return (
      <div className="container page">
        <div className="help-hero">
          <span className="eyebrow">A LITTLE HELP GOES A LONG WAY</span>
          <h1>{topic ? `${titleCase(topic)} help` : 'How can we help?'}</h1>
          <p>Good answers, right where you need them.</p>
          <Input
            aria-label="Search help"
            placeholder="Search for an answer…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="help-grid">
          {helpTopics.map((t) => (
            <Link key={t} href={`/help/${t.toLowerCase()}`}>
              {t}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
        <div className="article">
          <h2>A few helpful answers</h2>
          {faqs
            .filter(
              ([t, title, answer]) =>
                (!topic || t.toLowerCase() === topic) &&
                `${title} ${answer}`.toLowerCase().includes(q.toLowerCase()),
            )
            .map(([t, title, answer]) => (
              <details key={t} className="faq">
                <summary>{title}</summary>
                <p>{answer}</p>
              </details>
            ))}
          <div className="support-banner">
            <div>
              <h2>Still need a hand?</h2>
              <p>Tell us what you’re working through.</p>
            </div>
            <Button asChild>
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  if (slug === 'contact' || slug === 'report')
    return (
      <div className="container page">
        <div className="article">
          <Breadcrumbs
            items={[{ label: slug === 'contact' ? 'Contact us' : 'Report a concern' }]}
          />
          <span className="eyebrow">WE’RE HERE TO LISTEN</span>
          <h1>{slug === 'contact' ? 'Let’s talk.' : 'Something not quite right?'}</h1>
          <p>
            This form creates a local demo support record. No message is sent to an external
            service.
          </p>
          {done ? (
            <div className="panel">
              <h2>Your message is in.</h2>
              <p>Your request is saved and visible in the demo admin Reports area.</p>
              <Button onClick={() => setDone(false)} variant="outline">
                Send another request
              </Button>
            </div>
          ) : (
            <form
              className="panel"
              onSubmit={async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                setBusy(true);
                try {
                  await act(
                    'reports',
                    { target: String(data.target), reason: `${data.subject}: ${data.reason}` },
                    'Request recorded',
                  );
                  setDone(true);
                } catch {
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field
                label={
                  slug === 'report' ? 'Listing, user or order ID' : 'Your email (demo details only)'
                }
              >
                <Input name="target" required type={slug === 'contact' ? 'email' : 'text'} />
              </Field>
              <Field label="Topic">
                <Select name="subject">
                  {[
                    'General question',
                    'Buying',
                    'Selling',
                    'Payment',
                    'Delivery',
                    'Safety concern',
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Tell us more">
                <Textarea name="reason" minLength={10} required rows={6} />
              </Field>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Send request'}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  const article = articles[slug];
  if (!article) return null;
  return (
    <div className="container page">
      <article className="article">
        <Breadcrumbs items={[{ label: titleCase(slug) }]} />
        <span className="eyebrow">THE SHOPPER WAY</span>
        <h1>{article.title}</h1>
        <p className="lede">{article.intro}</p>
        {article.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <div className="support-banner">
          <div>
            <h2>A good place to begin.</h2>
            <p>Explore the marketplace or find a little help.</p>
          </div>
          <Button asChild>
            <Link href={slug === 'disputes' ? '/profile/purchases' : '/help'}>
              {slug === 'disputes' ? 'Your purchases' : 'Visit the help center'}
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}
