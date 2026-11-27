export function Skeleton({ className = '' }) {
  return <div className={`skeleton min-h-4 ${className}`} aria-hidden="true" />;
}

export default function LoadingState({ label = 'Loading data', rows = 4 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4" data-testid="loading-state">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
