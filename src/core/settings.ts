/**
 * Player settings: mute (persisted between sessions) and pause (per-run), plus a
 * helper that reports the OS "reduce motion" accessibility preference.
 */

const MUTE_KEY = 'catch-living-things:muted';

export class Settings {
  private _muted = false;
  private _paused = false;

  constructor() {
    // Restore the saved mute preference. Wrapped in try/catch because localStorage
    // can throw in private-browsing modes or sandboxed frames.
    try {
      this._muted = localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      this._muted = false;
    }
  }

  get muted(): boolean {
    return this._muted;
  }

  set muted(value: boolean) {
    this._muted = value;
    try {
      localStorage.setItem(MUTE_KEY, String(value));
    } catch {
      /* ignore persistence failures — muting still works for this session */
    }
  }

  get paused(): boolean {
    return this._paused;
  }

  set paused(value: boolean) {
    this._paused = value;
  }
}

/**
 * Reads the `prefers-reduced-motion` media query. When true we scale back or skip
 * GSAP animations so the game is comfortable for motion-sensitive players. Read
 * live (not cached) so it responds if the user changes the OS setting mid-session.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
