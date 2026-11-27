import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../api/client';

export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => {
        if (active) setState((previous) => ({ ...previous, loading: true, error: null }));
        return fetcher();
      })
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ data: null, loading: false, error: errorMessage(error) });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { ...state, refetch, setData: (data) => setState((s) => ({ ...s, data })) };
}
