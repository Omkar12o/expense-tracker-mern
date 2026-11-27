import { Card, CardBody } from '../ui/Card';
import TransactionFilters from './TransactionFilters';

export default function TransactionsToolbar({
  filters,
  update,
  reset,
  categories,
  accounts,
  onExport,
  exporting,
}) {
  return (
    <Card>
      <CardBody>
        <TransactionFilters
          filters={filters}
          update={update}
          reset={reset}
          categories={categories}
          accounts={accounts}
          onExport={onExport}
          exporting={exporting}
        />
      </CardBody>
    </Card>
  );
}
