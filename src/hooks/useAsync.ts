import { useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

/**
 * Run an async producer once (or when `deps` change) and track its state.
 * Guards against setting state after unmount / a superseded run. This app is
 * read-only, so there is no retry/mutation surface — just fetch-and-render.
 */
export function useAsync<T>(
  producer: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'loading',
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: null, error: null });
    producer().then(
      (data) => {
        if (active) setState({ status: 'success', data, error: null });
      },
      (err: unknown) => {
        if (active) {
          setState({
            status: 'error',
            data: null,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      },
    );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
