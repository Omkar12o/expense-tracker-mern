import Button from './Button';
import Alert from './Alert';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  title = 'Unable to load this section',
}) {
  return (
    <div className="space-y-4" data-testid="error-state">
      <Alert variant="error" title={title}>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
