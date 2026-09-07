/**
 * Builds the Phaser.Game configuration.
 *
 * Key Phaser concepts on show here:
 *  • Scenes — self-contained screens/states. We run two at once: an ambient
 *    BackgroundScene (drifting clouds) and the interactive GameScene on top.
 *  • Scale manager — FIT keeps our 800×600 design ratio and letterboxes it to
 *    fill any screen while auto-centring it.
 *  • Arcade physics — a lightweight physics system; we use it to move falling
 *    items and to detect when the basket overlaps one.
 */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { theme } from '../ui/theme';
import { BackgroundScene } from './scenes/BackgroundScene';
import { GameScene } from './scenes/GameScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO, // WebGL where available, Canvas as a fallback
    parent,
    backgroundColor: theme.skyTop,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 }, // items get an explicit downward velocity instead
        debug: false,
      },
    },
    // BackgroundScene starts automatically; GameScene is registered but inactive
    // until the player picks a topic and we call scene.start('Game', …).
    scene: [BackgroundScene, GameScene],
  };
}
