'use client';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { Category } from '@prisma/client';
import type { Product } from '@/types';
import { Check, ArrowRight, ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { listingSchema } from '@/lib/validation';
import { useMarket } from '../marketplace/provider';
import { ImageFallback } from '../marketplace/image-fallback';
import { Button } from '../ui/button';
import { Field, Input, Select, Textarea } from '../ui/primitives';
import { z } from 'zod';
import { money } from '@/lib/utils';
type Values = z.input<typeof listingSchema>;
const steps = [
  'Category',
  'The basics',
  'Photos',
  'Specifications',
  'Pricing',
  'Delivery',
  'Preview',
  'Publish',
];
export function ListingForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter(),
    { act } = useMarket();
  const [step, setStep] = useState(0),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false);
  const form = useForm<Values>({
    defaultValues: {
      categoryId: product?.categoryId || 'electronics',
      subcategory: product?.subcategory || 'Cameras',
      title: product?.title || '',
      description: product?.description || '',
      condition: (product?.condition as Values['condition']) || 'Very good',
      brand: product?.brand || '',
      model: product?.model || '',
      specifications: product?.specifications || '{}',
      image:
        product?.images[0]?.url ||
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85',
      price: (product?.price || 0) / 100,
      quantity: product?.quantity || 1,
      location: product?.location || 'Zürich',
      delivery: product?.delivery ?? true,
      pickup: product?.pickup ?? true,
      listingType: (product?.listingType as Values['listingType']) || 'Fixed price',
      allowOffers: product?.allowOffers ?? true,
      duration: 7,
      minimumBid: (product?.minimumBid || 500) / 100,
    },
  });
  const v = useWatch({ control: form.control }) as Values;
  const draftKey = `seconda-draft-${product?.id || 'new'}`;
  useEffect(() => {
    if (!product) {
      try {
        const draft = localStorage.getItem(draftKey);
        if (draft) form.reset(JSON.parse(draft));
      } catch {}
    }
    const sub = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        localStorage.setItem(draftKey, JSON.stringify(values));
        setSaved(true);
      },
    });
    return sub;
  }, [draftKey, form, product]);
  function next() {
    setError('');
    if (
      step === 1 &&
      (!v.title || v.title.length < 5 || !v.description || v.description.length < 20)
    ) {
      setError('Add a title of at least 5 characters and a description of at least 20 characters.');
      return;
    }
    if (step === 3 && !v.brand) {
      setError('Please enter a brand (or Unbranded).');
      return;
    }
    if (step === 4 && Number(v.price) < 1) {
      setError('Set a price of at least CHF 1.');
      return;
    }
    setStep((s) => s + 1);
  }
  async function publish() {
    setBusy(true);
    setError('');
    try {
      const data = listingSchema.parse({
        ...v,
        price: Math.round(Number(v.price) * 100),
        minimumBid: Math.round(Number(v.minimumBid) * 100),
      });
      const p = (await act(
        'listings',
        { ...data, ...(product ? { id: product.id, action: 'save' } : {}) },
        product ? 'Listing updated' : 'Your listing is live',
      )) as Product;
      localStorage.removeItem(draftKey);
      router.push(`/listing/${p.slug}`);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof z.ZodError
          ? e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
          : e instanceof Error
            ? e.message
            : 'Unable to publish',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="container page sell-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">LET’S FIND IT A NEW HOME</span>
          <h1>{product ? 'A little refresh.' : 'Good things start here.'}</h1>
          <p>A few details today. Someone’s favourite tomorrow.</p>
        </div>
        <span className="draft-status">
          <Save size={15} />
          {saved ? 'Draft saved on this device' : 'Your draft saves automatically'}
        </span>
      </div>
      <div className="wizard-steps">
        {steps.map((s, i) => (
          <button
            key={s}
            disabled={i > step}
            className={i === step ? 'active' : i < step ? 'done' : ''}
            onClick={() => setStep(i)}
          >
            <span>{i < step ? <Check size={15} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <div className="wizard panel">
        <div className="wizard-heading">
          <small>STEP {step + 1} OF 8</small>
          <h2>
            {
              [
                'Where does it belong?',
                'Tell its story.',
                'Show its best side.',
                'The little details matter.',
                'Find the right price.',
                'How will it get there?',
                'Looking good. Take a final look.',
                'Ready for its next chapter?',
              ][step]
            }
          </h2>
        </div>
        {step === 0 && (
          <div className="category-choice">
            {categories.map((c) => (
              <button
                className={v.categoryId === c.id ? 'selected' : ''}
                key={c.id}
                onClick={() => {
                  form.setValue('categoryId', c.id);
                  form.setValue('subcategory', c.subcategories.split(',')[0]);
                }}
              >
                {c.name}
                <span>{c.subcategories.replaceAll(',', ' · ')}</span>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <>
            <Field label="Title">
              <Input placeholder="e.g. Fujifilm X-T4 with 35mm lens" {...form.register('title')} />
            </Field>
            <Field label="Description">
              <Textarea
                rows={6}
                placeholder="What makes it special? Include its condition, what's included, and any signs of use."
                {...form.register('description')}
              />
            </Field>
            <div className="two-col">
              <Field label="Condition">
                <Select {...form.register('condition')}>
                  {['New', 'Like new', 'Very good', 'Good'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Subcategory">
                <Select {...form.register('subcategory')}>
                  {categories
                    .find((c) => c.id === v.categoryId)
                    ?.subcategories.split(',')
                    .map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                </Select>
              </Field>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div
              className="photo-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const url = e.dataTransfer.getData('text/uri-list');
                if (url.startsWith('https://images.unsplash.com/')) form.setValue('image', url);
                else setError('For this demo, drop or paste an Unsplash image URL.');
              }}
            >
              <ImagePlus size={34} />
              <h3>A photo is worth a thousand words.</h3>
              <p>
                Drop an Unsplash image link here, or paste it below.
                <br />
                Demo image URLs are used instead of file uploads.
              </p>
            </div>
            <Field label="Photo URL">
              <Input {...form.register('image')} />
            </Field>
            <div className="upload-preview">
              <ImageFallback src={v.image} alt="Listing preview" />
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="two-col">
              <Field label="Brand">
                <Input {...form.register('brand')} />
              </Field>
              <Field label="Model">
                <Input {...form.register('model')} />
              </Field>
            </div>
            <Field label="Included accessories">
              <Input
                onChange={(e) =>
                  form.setValue(
                    'specifications',
                    JSON.stringify({ Brand: v.brand, Included: e.target.value }),
                  )
                }
                placeholder="Original box, charger, manual…"
              />
            </Field>
          </>
        )}
        {step === 4 && (
          <>
            <div className="two-col">
              <Field label="Buying format">
                <Select {...form.register('listingType')}>
                  <option>Fixed price</option>
                  <option>Auction</option>
                </Select>
              </Field>
              <Field label={v.listingType === 'Auction' ? 'Starting bid (CHF)' : 'Price (CHF)'}>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                />
              </Field>
              <Field label="Quantity">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  {...form.register('quantity', { valueAsNumber: true })}
                />
              </Field>
            </div>
            {v.listingType === 'Auction' && (
              <div className="two-col">
                <Field label="Minimum bid increment (CHF)">
                  <Input
                    type="number"
                    min="1"
                    {...form.register('minimumBid', { valueAsNumber: true })}
                  />
                </Field>
                <Field label="Duration (days)">
                  <Select {...form.register('duration', { valueAsNumber: true })}>
                    {[1, 3, 7, 14, 30].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            )}
            <label className="check">
              <input type="checkbox" {...form.register('allowOffers')} />
              Open to offers
            </label>
          </>
        )}
        {step === 5 && (
          <>
            <Field label="Location">
              <Input {...form.register('location')} />
            </Field>
            <label className="radio-card">
              <input type="checkbox" {...form.register('delivery')} />
              Delivery across Switzerland<small>CHF 7.90 per order</small>
            </label>
            <label className="radio-card">
              <input type="checkbox" {...form.register('pickup')} />
              Free local pickup<small>Arrange with the buyer</small>
            </label>
          </>
        )}
        {step === 6 && (
          <div className="listing-preview">
            <div className="gallery-main">
              <ImageFallback src={v.image} alt={v.title} />
            </div>
            <div>
              <span className="eyebrow">{v.condition}</span>
              <h2>{v.title}</h2>
              <h3>{money(Number(v.price) * 100)}</h3>
              <p>{v.description}</p>
              <p>
                {v.brand} · {v.location} · {v.listingType}
              </p>
            </div>
          </div>
        )}
        {step === 7 && (
          <div className="publish-ready">
            <div className="success-icon">
              <Check size={32} />
            </div>
            <h2>One more thing, one more story.</h2>
            <p>
              Your listing will be visible in the demo marketplace immediately. You can edit, pause
              or archive it from your account.
            </p>
            <label className="check">
              <input type="checkbox" required checked={v.quantity > 0} readOnly />
              I’ve reviewed the details of this demo listing.
            </label>
          </div>
        )}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div className="wizard-actions">
          <Button
            variant="outline"
            disabled={step === 0 || busy}
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          {step < 7 ? (
            <Button onClick={next}>
              Continue <ArrowRight size={17} />
            </Button>
          ) : (
            <Button disabled={busy} onClick={() => void publish()}>
              {busy ? 'Publishing…' : product ? 'Save changes' : 'Publish listing'}
              <ArrowRight size={17} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
