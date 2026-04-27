import { ErrorHandler, Injectable } from '@angular/core';
import { isChunkLoadError } from '../utils/lazy-load';

/**
 * Catches any ChunkLoadError that escapes the lazy-load retry layer
 * (e.g. fired from inside an already-loaded module's dynamic import) and
 * triggers a single throttled reload to recover the app.
 *
 * All other errors are re-thrown to Angular's default handler so logging
 * tools (Sentry, console, etc.) still see them.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly fallback = new ErrorHandler();
  private readonly RELOAD_KEY = '__chunk_reload_at__';
  private readonly RELOAD_THROTTLE_MS = 10_000;

  handleError(error: unknown): void {
    if (isChunkLoadError(error) && this.tryReload()) return;
    this.fallback.handleError(error);
  }

  private tryReload(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const last = Number(sessionStorage.getItem(this.RELOAD_KEY) ?? 0);
      if (Date.now() - last < this.RELOAD_THROTTLE_MS) return false;
      sessionStorage.setItem(this.RELOAD_KEY, String(Date.now()));
    } catch {
      /* ignore — sessionStorage might be blocked */
    }
    window.location.reload();
    return true;
  }
}
