import { useCallback, useEffect, useState, type DependencyList } from 'react';

interface FetchState<T> {
    data: T | null;
    error: unknown;
    loading: boolean;
}

/**
 * Runs `loader` whenever `deps` change, cancelling the previous request.
 * Returns the latest result plus a `reload` callback.
 */
export function useFetch<T>(loader: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
    const [state, setState] = useState<FetchState<T>>({ data: null, error: null, loading: true });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setState((s) => ({ ...s, loading: true, error: null }));
        loader(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setState({ data, error: null, loading: false });
            })
            .catch((error: unknown) => {
                if (!controller.signal.aborted) setState({ data: null, error, loading: false });
            });
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, attempt]);

    const reload = useCallback(() => setAttempt((n) => n + 1), []);
    return { ...state, reload };
}
