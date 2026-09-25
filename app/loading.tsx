import { Skeleton } from '@/components/ui/primitives';
export default function Loading() {
  return (
    <div className="container page" aria-label="Loading marketplace">
      <div className="skeleton" style={{ height: 40, width: '45%', marginBottom: 30 }} />
      <div className="product-grid">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    </div>
  );
}
