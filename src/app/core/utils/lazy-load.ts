/**
 * Production-grade lazy-loader for Angular `loadChildren` / `loadComponent`.
 *
 * Wraps a dynamic `import()` with:
 *   1. Exponential-backoff retries on transient chunk-load failures
 *      (network blips, dev-server rebuilds, rapid refreshes).
 *   2. A one-shot hard reload as a last resort when the deployed asset
 *      manifest changed (new build) and the client is holding stale hashes.
 *   3. Re-load throttling via sessionStorage so we never enter a reload loop.
 *
 * This is what eliminates the "rapid refresh redirects to /dashboard"
 * symptom: chunk failures no longer fall through to the wildcard route.
 */

const RELOAD_THROTTLE_KEY = '__chunk_reload_at__';
const RELOAD_THROTTLE_MS = 10_000;

export function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message ?? err);
  const name = String((err as any)?.name ?? '');
  return (
    name === 'ChunkLoadError' ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Loading CSS chunk/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg)
  );
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function safeHardReload(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_THROTTLE_KEY) ?? 0);
    if (Date.now() - last < RELOAD_THROTTLE_MS) return false;
    sessionStorage.setItem(RELOAD_THROTTLE_KEY, String(Date.now()));
  } catch {
    /* sessionStorage may be blocked — proceed anyway */
  }
  window.location.reload();
  return true;
}

interface LazyLoadOptions {
  retries?: number;
  baseDelayMs?: number;
}

export function lazyLoad<T>(
  loader: () => Promise<T>,
  { retries = 3, baseDelayMs = 400 }: LazyLoadOptions = {},
): () => Promise<T> {
  return async () => {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await loader();
      } catch (err) {
        lastErr = err;
        if (!isChunkLoadError(err)) throw err;
        if (attempt === retries) break;
        const jitter = Math.random() * 150;
        await sleep(baseDelayMs * 2 ** attempt + jitter);
      }
    }
    if (safeHardReload()) {
      // Pause forever so the router doesn't fall through to the wildcard
      // while the page is in the middle of reloading.
      return new Promise<T>(() => {});
    }
    throw lastErr;
  };
}
