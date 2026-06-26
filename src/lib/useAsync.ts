import { useEffect, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Run an async function on mount (and when deps change), tracking state. */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState({ data: null, loading: true, error: null });
    fn()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (alive)
          setState({ data: null, loading: false, error: String(e?.message ?? e) });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
