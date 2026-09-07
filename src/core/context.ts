/**
 * The bundle of shared services the Phaser scenes need from the outside world.
 * main.ts stashes one of these in the Phaser registry; GameScene reads it back
 * with `this.registry.get('ctx')`. This keeps the gameplay code decoupled from
 * how the page, audio, and overlay are wired together.
 *
 * All imports here are type-only, so there is no runtime circular dependency.
 */
import type { Overlay } from '../ui/overlay';
import type { Settings } from './settings';
import type { Sfx } from './audio';

export interface GameContext {
  overlay: Overlay;
  settings: Settings;
  sfx: Sfx;
}
