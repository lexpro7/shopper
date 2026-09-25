'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { useMarket } from '../marketplace/provider';
import { Avatar, EmptyState, Field, Input, Modal, Textarea } from '../ui/primitives';
import { Button } from '../ui/button';
export function Messages() {
  const { account, act } = useMarket(),
    params = useSearchParams();
  const [selected, setSelected] = useState(params.get('conversation') || ''),
    [text, setText] = useState(''),
    [modal, setModal] = useState(''),
    [amount, setAmount] = useState(''),
    [report, setReport] = useState('');
  if (!account) return null;
  const c = account.messages.find((c) => c.id === selected) || account.messages[0];
  if (!c)
    return (
      <>
        <h1>Your messages</h1>
        <EmptyState
          title="Good conversations start with a find"
          text="Message a seller from any listing to get started."
        />
      </>
    );
  async function send(e: React.FormEvent) {
    e.preventDefault();
    try {
      await act('messages', { id: c.id, text }, '');
      setText('');
    } catch {}
  }
  return (
    <>
      <h1>Your messages</h1>
      <div className={`chat-layout ${selected ? 'selected' : ''}`}>
        <aside className="conversations">
          {account.messages.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv.id)}
              className={conv.id === c.id ? 'active' : ''}
            >
              <Avatar name={conv.sellerId} />
              <span>
                <b>{conv.sellerId === account.user.id ? conv.buyerId : conv.sellerId}</b>
                <small>{conv.listing.title}</small>
                <p>{conv.messages.at(-1)?.text || 'Start a conversation'}</p>
              </span>
            </button>
          ))}
        </aside>
        <div className="chat-main">
          <div className="chat-header">
            <Button
              size="icon"
              variant="ghost"
              className="chat-back"
              aria-label="Back to conversations"
              onClick={() => setSelected('')}
            >
              <ArrowLeft size={17} />
            </Button>
            <div>
              <h3>{c.sellerId === account.user.id ? c.buyerId : c.sellerId}</h3>
              <small>{c.blocked ? 'Conversation blocked' : 'Typically replies within a day'}</small>
            </div>
            <div className="inline-actions">
              <Button size="sm" variant="ghost" onClick={() => setModal('Make an offer')}>
                Offer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setModal('Report conversation')}>
                Report
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  void act(
                    'messages',
                    { id: c.id, action: 'block' },
                    c.blocked ? 'Unblocked' : 'Blocked',
                  ).catch(() => {})
                }
              >
                {c.blocked ? 'Unblock' : 'Block'}
              </Button>
            </div>
          </div>
          <Link className="chat-listing" href={`/listing/${c.listing.slug}`}>
            About: {c.listing.title} ↗
          </Link>
          <div className="chat-messages">
            {c.messages.map((m) => (
              <div className={`bubble ${m.userId === account.user.id ? 'own' : ''}`} key={m.id}>
                {m.text}
                <small>
                  {m.user.firstName} ·{' '}
                  {new Date(m.createdAt).toLocaleTimeString('en-CH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </div>
            ))}
          </div>
          <form className="chat-compose" onSubmit={send}>
            <label className="icon-button" title="Attach file name (demo)">
              <Paperclip size={18} />
              <input
                type="file"
                className="sr-only"
                aria-label="Attach a file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    setText((t) => `${t} [Attachment: ${file.name} — demo, file not uploaded]`);
                }}
              />
            </label>
            <Input
              aria-label="Message"
              placeholder={c.blocked ? 'Unblock to send a message' : 'Write a friendly hello…'}
              value={text}
              disabled={c.blocked}
              onChange={(e) => setText(e.target.value)}
              required
              maxLength={2000}
            />
            <Button aria-label="Send message" disabled={!text.trim() || c.blocked} type="submit">
              <Send size={17} />
            </Button>
          </form>
        </div>
      </div>
      <Modal title={modal} open={!!modal} onOpenChange={(v) => !v && setModal('')}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (modal === 'Make an offer')
                await act(
                  'offers',
                  { id: c.listingId, amount: Math.round(Number(amount) * 100) },
                  'Offer sent',
                );
              else await act('reports', { target: c.id, reason: report }, 'Report received');
              setModal('');
            } catch {}
          }}
        >
          {modal === 'Make an offer' ? (
            <Field label="Amount (CHF)">
              <Input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          ) : (
            <Field label="Reason">
              <Textarea
                required
                minLength={10}
                value={report}
                onChange={(e) => setReport(e.target.value)}
              />
            </Field>
          )}
          <Button className="full" type="submit">
            Send
          </Button>
        </form>
      </Modal>
    </>
  );
}
