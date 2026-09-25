import { EmptyState } from '@/components/ui/primitives';
export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        title="This find has wandered off."
        text="We couldn’t find that page. There are plenty of good things still to discover."
      />
    </div>
  );
}
