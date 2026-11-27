import { useCallback, useMemo, useState } from 'react';
import { useDebounce } from './useDebounce';

const defaults = {
  page: 1,
  limit: 10,
  type: '',
  category: '',
  account: '',
  from: '',
  to: '',
  minAmount: '',
  maxAmount: '',
  search: '',
};

export function useTransactionFilters() {
  const [filters, setFilters] = useState(defaults);
  const debouncedSearch = useDebounce(filters.search, 300);

  const update = useCallback((key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? Number(value) : 1,
    }));
  }, []);

  const reset = useCallback(() => setFilters(defaults), []);

  const params = useMemo(() => {
    const result = { page: filters.page, limit: filters.limit };
    for (const key of ['type', 'category', 'account', 'from', 'to']) {
      if (filters[key]) result[key] = filters[key];
    }
    for (const key of ['minAmount', 'maxAmount']) {
      const value = Number(filters[key]);
      if (filters[key] !== '' && Number.isFinite(value)) result[key] = value;
    }
    const search = debouncedSearch.trim();
    if (search) result.search = search;
    return result;
  }, [filters, debouncedSearch]);

  return { filters, update, reset, params, debouncedSearch };
}
