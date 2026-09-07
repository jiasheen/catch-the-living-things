/**
 * Pure scoring logic — no Phaser, no DOM.
 *
 * Keeping the rules in a dependency-free module makes them easy to read, reason
 * about, and unit-test in isolation from the rendering code.
 */
import type { GameResult } from './types';

export const STARTING_LIVES = 3;
export const POINTS_PER_CATCH = 10;

/** Mutable run-state for a single play-through. */
export interface Stats {
  score: number;
  lives: number;
  correctCatches: number;
  wrongCatches: number;
  missedTargets: number;
}

export function createStats(): Stats {
  return {
    score: 0,
    lives: STARTING_LIVES,
    correctCatches: 0,
    wrongCatches: 0,
    missedTargets: 0,
  };
}

/** Caught a target item: award points. */
export function registerCorrectCatch(stats: Stats): void {
  stats.score += POINTS_PER_CATCH;
  stats.correctCatches += 1;
}

/** Caught something that should have been avoided: lose a life. */
export function registerWrongCatch(stats: Stats): void {
  stats.lives = Math.max(0, stats.lives - 1);
  stats.wrongCatches += 1;
}

/** A target item fell off the bottom uncaught. Tracked for accuracy only. */
export function registerMissedTarget(stats: Stats): void {
  stats.missedTargets += 1;
}

export function isGameOver(stats: Stats): boolean {
  return stats.lives <= 0;
}

/** Build the end-of-game summary. `cleared` = finished all rounds while alive. */
export function computeResult(stats: Stats, cleared: boolean): GameResult {
  const catches = stats.correctCatches + stats.wrongCatches;
  const accuracy = catches === 0 ? 0 : stats.correctCatches / catches;
  return {
    score: stats.score,
    correctCatches: stats.correctCatches,
    wrongCatches: stats.wrongCatches,
    missedTargets: stats.missedTargets,
    accuracy,
    cleared,
  };
}

/** Convert a 0–1 accuracy into a whole percentage for display. */
export function accuracyPercent(accuracy: number): number {
  return Math.round(accuracy * 100);
}
