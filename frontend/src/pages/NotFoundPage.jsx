import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="That link does not lead anywhere." />
      <Card>
        <EmptyState
          icon="🧭"
          title="Lost your way?"
          description="Head back to your dashboard to keep tracking."
          actionLabel="Go to dashboard"
          to="/dashboard"
        />
      </Card>
    </>
  );
}
