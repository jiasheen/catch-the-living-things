/**
 * Shared type definitions for the whole game.
 *
 * Keeping these in one place means the data file (src/data/topics.ts), the game
 * scene, and the UI overlay all agree on the exact shape of the content. Change
 * the content model here and TypeScript will flag every place that needs updating.
 */

/** A single falling object the player can catch. */
export interface Item {
  /** The glyph drawn on the canvas. We use emoji so there are zero image assets to load. */
  emoji: string;
  /**
   * A plain-language name for the item, e.g. "turtle" or "red circle".
   * Used for accessibility and so nothing ever depends on colour alone.
   */
  label: string;
  /** True if this item belongs to the round's target category (a "good" catch). */
  correct: boolean;
}

/** Encouraging messages shown when the player catches the right / wrong thing. */
export interface Feedback {
  correct: string;
  wrong: string;
}

/** A complete, self-contained topic. Add new topics in src/data/topics.ts. */
export interface Topic {
  /** Stable id used to select the topic (kept out of the visible UI). */
  id: string;
  /** Friendly name shown on the menu button, e.g. "Animals". */
  title: string;
  /** A short emoji that decorates the topic button. */
  icon: string;
  /** The instruction shown to the player, e.g. "Catch the animals!". */
  prompt: string;
  /** Name of the category to CATCH (shown in the HUD so it's never colour-only). */
  targetLabel: string;
  /** Name of the category to AVOID. */
  avoidLabel: string;
  /** Every catchable object for this topic (a mix of correct items + distractors). */
  items: Item[];
  /** Messages for right / wrong catches. */
  feedback: Feedback;
}

/** Difficulty settings for one round. Rounds get faster as the array progresses. */
export interface RoundConfig {
  /** Shown in the HUD, e.g. "Round 1". */
  label: string;
  /** How long the round lasts, in milliseconds. */
  durationMs: number;
  /** How often a new item spawns, in milliseconds (smaller = harder). */
  spawnEveryMs: number;
  /** Falling speed in pixels per second (bigger = harder). */
  fallSpeed: number;
}

/** The end-of-game summary the results screen renders. */
export interface GameResult {
  score: number;
  correctCatches: number;
  wrongCatches: number;
  missedTargets: number;
  /** correct / (correct + wrong), from 0 to 1. */
  accuracy: number;
  /** True if the player cleared every round without running out of lives. */
  cleared: boolean;
}
