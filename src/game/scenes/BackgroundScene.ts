/**
 * A non-interactive backdrop that runs in parallel behind the game: a soft sky
 * gradient with a few drifting clouds. This demonstrates Phaser's ability to run
 * multiple scenes at once, and adds gentle life without distracting from play.
 * Cloud drift is disabled under `prefers-reduced-motion`.
 */
import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { theme } from '../../ui/theme';
import { prefersReducedMotion } from '../../core/settings';

export class BackgroundScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Background' });
  }

  create(): void {
    this.drawSky();

    const reduced = prefersReducedMotion();
    const cloudCount = 5;
    for (let i = 0; i < cloudCount; i++) {
      const y = 50 + (i * GAME_HEIGHT) / (cloudCount + 1);
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const cloud = this.add
        .text(x, y, '☁️', { fontSize: `${Phaser.Math.Between(40, 72)}px` })
        .setOrigin(0.5)
        .setAlpha(0.85);

      if (reduced) continue; // no drifting for motion-sensitive players

      this.tweens.add({
        targets: cloud,
        x: x + GAME_WIDTH + 120,
        duration: Phaser.Math.Between(24000, 40000),
        repeat: -1,
        onRepeat: () => {
          cloud.x = -120;
          cloud.y = Phaser.Math.Between(40, GAME_HEIGHT - 140);
        },
      });
    }
  }

  /** Paints a vertical gradient with a single filled graphics rectangle. */
  private drawSky(): void {
    const g = this.add.graphics();
    const top = Phaser.Display.Color.HexStringToColor(theme.skyTop).color;
    const bottom = Phaser.Display.Color.HexStringToColor(theme.skyBottom).color;
    // fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, alpha)
    g.fillGradientStyle(top, top, bottom, bottom, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}
