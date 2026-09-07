/**
 * GSAP-powered animation helpers.
 *
 * Why GSAP in a Phaser game? Phaser has its own tween system, but GSAP is a
 * dedicated animation library that can tween ANY JavaScript object — including
 * both our HTML overlay elements AND Phaser game objects (their .x / .y / .alpha
 * are plain numeric properties Phaser reads every frame). Centralising motion
 * here means one place enforces the `prefers-reduced-motion` rule.
 *
 * Under reduced motion we never remove feedback — we jump to the end state (or
 * use a tiny, gentle change) so the information is still there without movement.
 */
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../core/settings';

/** The numeric props we tween on a floating popup. A Phaser Text satisfies this. */
interface FloatTarget {
  x: number;
  y: number;
  alpha: number;
}

/**
 * Float a score popup (a Phaser Text object) upward while fading out, then run
 * `onDone` so the caller can destroy it. With reduced motion we simply hold it in
 * place and fade.
 */
export function floatScorePopup(target: FloatTarget, onDone: () => void): void {
  if (prefersReducedMotion()) {
    gsap.to(target, { alpha: 0, duration: 0.9, delay: 0.4, onComplete: onDone });
    return;
  }
  gsap.to(target, {
    y: target.y - 70,
    alpha: 0,
    duration: 0.9,
    ease: 'power1.out',
    onComplete: onDone,
  });
}

/** A quick "pop" scale on any DOM element to acknowledge a change. No-op if reduced. */
export function pop(el: Element): void {
  if (prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.18, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' },
  );
}

/** Bring an overlay panel in. Reduced motion → appears with no movement. */
export function panelIn(el: Element): void {
  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 });
    return;
  }
  gsap.fromTo(
    el,
    { autoAlpha: 0, y: 24, scale: 0.96 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)' },
  );
}

/**
 * One celebration moment when the player clears the game: a gentle burst of emoji
 * confetti. Skipped entirely under reduced motion (no flashing, no movement) — the
 * summary card still shows a 🎉, so nothing is lost.
 */
export function celebrate(host: HTMLElement): void {
  if (prefersReducedMotion()) return;
  const pieces = ['🎉', '⭐', '🎊', '✨', '🏆'];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span');
    bit.textContent = pieces[i % pieces.length];
    bit.className = 'confetti-bit';
    host.appendChild(bit);
    gsap.fromTo(
      bit,
      { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.7, 1.4) },
      {
        x: gsap.utils.random(-180, 180),
        y: gsap.utils.random(-40, 260),
        rotation: gsap.utils.random(-180, 180),
        opacity: 0,
        duration: gsap.utils.random(1.1, 1.8),
        ease: 'power1.out',
        onComplete: () => bit.remove(),
      },
    );
  }
}
