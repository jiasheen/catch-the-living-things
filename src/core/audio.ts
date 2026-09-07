/**
 * Minimal sound effects generated with the Web Audio API — no audio files, so
 * there is nothing to download (keeps the game tiny and fast on classroom laptops).
 *
 * Browsers block audio until the first user interaction, so we lazily create and
 * resume the AudioContext when the game starts (always after a click/tap on
 * "Start"). Every call is defensive: if Web Audio is missing or blocked, sounds
 * simply no-op and the game keeps working.
 */
import type { Settings } from './settings';

export class Sfx {
  private ctx: AudioContext | null = null;

  constructor(private settings: Settings) {}

  /** Call once from a user gesture (e.g. the Start button) to unlock audio. */
  unlock(): void {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctor) this.ctx = new Ctor();
      }
      if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  /** A short two-note "ding" for a correct catch. */
  correct(): void {
    this.blip(660, 0.08);
    this.blip(880, 0.09, 0.08);
  }

  /** A low "buzz" for a wrong catch. */
  wrong(): void {
    this.blip(160, 0.18, 0, 'square');
  }

  private blip(freq: number, duration: number, delay = 0, type: OscillatorType = 'sine'): void {
    if (this.settings.muted || !this.ctx) return;
    try {
      const start = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      // A quick attack/decay envelope so the note doesn't click.
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch {
      /* ignore — audio is a nice-to-have, never critical */
    }
  }
}
