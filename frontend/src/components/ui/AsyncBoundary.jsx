import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

export default function AsyncBoundary({
  loading,
  error,
  empty = false,
  onRetry,
  skeletonRows = 4,
  emptyProps = {},
  children,
}) {
  if (loading) return <LoadingState rows={skeletonRows} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (empty) return <EmptyState {...emptyProps} />;
  return children;
}
