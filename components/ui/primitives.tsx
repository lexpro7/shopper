'use client';
import Link from 'next/link';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, PackageOpen, Star, ChevronRight, Minus, Plus } from 'lucide-react';
import { cn, money } from '@/lib/utils';
import { Button } from './button';
export function Input(props: React.ComponentProps<'input'>) {
  return <input {...props} className={cn('input', props.className)} />;
}
export function Textarea(props: React.ComponentProps<'textarea'>) {
  return <textarea {...props} className={cn('input textarea', props.className)} />;
}
export function Select(props: React.ComponentProps<'select'>) {
  return <select {...props} className={cn('input', props.className)} />;
}
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  );
}
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('badge', className)}>{children}</span>;
}
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('panel', className)}>{children}</div>;
}
export function Avatar({ name, size = '' }: { name: string; size?: string }) {
  return (
    <span className={cn('avatar', size)} aria-label={name}>
      {name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')}
    </span>
  );
}
export function Rating({ value = 4.9, count }: { value?: number; count?: number }) {
  return (
    <span className="rating">
      <Star size={13} fill="currentColor" />
      {value.toFixed(1)}
      {count !== undefined && <span className="muted"> ({count})</span>}
    </span>
  );
}
export function Price({ value, original }: { value: number; original?: number | null }) {
  return (
    <span className="price">
      {money(value)}
      {original && original > value ? <del>{money(original)}</del> : null}
    </span>
  );
}
export function EmptyState({
  title = 'Nothing here yet',
  text = 'Your next great find is waiting.',
  href = '/search',
  action = 'Explore the marketplace',
}: {
  title?: string;
  text?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <PackageOpen size={42} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Button asChild>
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={value === t}
          className={value === t ? 'active' : ''}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link href="/">Home</Link>
      {items.map((i, n) => (
        <span key={n}>
          <ChevronRight size={13} />
          {i.href ? <Link href={i.href}>{i.label}</Link> : i.label}
        </span>
      ))}
    </nav>
  );
}
export function QuantitySelector({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function Modal({
  title,
  description,
  open,
  onOpenChange,
  children,
  drawer = false,
}: {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  drawer?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content className={cn('dialog', drawer && 'drawer')}>
          <DialogPrimitive.Title className="dialog-title">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="muted">
            {description || 'Review the details below.'}
          </DialogPrimitive.Description>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" className="dialog-close" aria-label="Close">
              <X size={20} />
            </Button>
          </DialogPrimitive.Close>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn('switch', checked && 'on')}
    >
      <span />
    </button>
  );
}
export function Skeleton() {
  return <div className="skeleton" />;
}
