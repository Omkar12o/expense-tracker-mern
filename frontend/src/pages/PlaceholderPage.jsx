import PageHeader from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

export default function PlaceholderPage({ title, description, icon, emptyTitle, emptyDescription }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      </Card>
    </>
  );
}
