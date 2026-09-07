/**
 * The interactive gameplay scene.
 *
 * Responsibilities:
 *  • Draw and move the basket (keyboard arrows / A-D, or drag on touch).
 *  • Spawn falling items from the current topic and give them downward velocity.
 *  • Detect catches (Arcade physics overlap) and apply the scoring rules.
 *  • Run the rounds, speeding up each time, then show the results.
 *
 * The scene talks to the outside world only through the shared GameContext it
 * reads from the registry — it never touches the DOM directly.
 */
import Phaser from 'phaser';
import type { Item, Topic } from '../../core/types';
import type { GameContext } from '../../core/context';
import type { Stats } from '../../core/scoring';
import {
  computeResult,
  createStats,
  isGameOver,
  registerCorrectCatch,
  registerMissedTarget,
  registerWrongCatch,
} from '../../core/scoring';
import { getTopic, ROUNDS } from '../../data/topics';
import { theme } from '../../ui/theme';
import { floatScorePopup } from '../../ui/animations';
import { prefersReducedMotion } from '../../core/settings';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';

/** How fast the basket slides under keyboard control (pixels per second). */
const KEYBOARD_SPEED = 560;
/** Half the basket's catch width, used to clamp it inside the play area. */
const BASKET_HALF = 34;

export class GameScene extends Phaser.Scene {
  private topic!: Topic;
  private stats!: Stats;
  private ctx!: GameContext;

  private basket!: Phaser.GameObjects.Text;
  private items!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  private targetX = GAME_WIDTH / 2;
  private currentFallSpeed = ROUNDS[0].fallSpeed;
  private roundIndex = 0;
  private gameOver = false;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private roundTimer?: Phaser.Time.TimerEvent;

  constructor() {
    // Registered but not auto-started; main.ts starts it with a chosen topic.
    super({ key: 'Game', active: false });
  }

  init(data: { topicId?: string }): void {
    this.topic = getTopic(data.topicId ?? 'animals');
    this.stats = createStats();
    this.roundIndex = 0;
    this.gameOver = false;
    this.targetX = GAME_WIDTH / 2;
    this.currentFallSpeed = ROUNDS[0].fallSpeed;
  }

  create(): void {
    this.ctx = this.registry.get('ctx') as GameContext;

    // Reset the HUD for a fresh run.
    this.ctx.overlay.setScore(0);
    this.ctx.overlay.setLives(this.stats.lives);
    this.ctx.overlay.setTarget(this.topic.targetLabel, this.topic.avoidLabel);

    this.createBasket();

    this.items = this.physics.add.group();
    this.physics.add.overlap(this.basket, this.items, this.handleCatch, undefined, this);

    this.setupInput();
    this.startRound(0);
  }

  update(_time: number, delta: number): void {
    if (this.gameOver) return;

    // Keyboard nudges a target position; the basket eases toward it so movement
    // feels smooth on both keyboard and touch.
    const step = (KEYBOARD_SPEED * delta) / 1000;
    if (this.cursors.left.isDown || this.keyA.isDown) this.targetX -= step;
    if (this.cursors.right.isDown || this.keyD.isDown) this.targetX += step;
    this.targetX = Phaser.Math.Clamp(this.targetX, BASKET_HALF, GAME_WIDTH - BASKET_HALF);
    this.basket.x = Phaser.Math.Linear(this.basket.x, this.targetX, 0.35);

    // Remove items that fell past the bottom; a missed target counts for accuracy.
    for (const child of this.items.getChildren().slice()) {
      const item = child as Phaser.GameObjects.Text;
      if (item.y > GAME_HEIGHT + 40) {
        if (item.getData('correct') === true) registerMissedTarget(this.stats);
        item.destroy();
      }
    }
  }

  private createBasket(): void {
    this.basket = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '🧺', { fontSize: '56px' })
      .setOrigin(0.5)
      .setDepth(5);
    this.physics.add.existing(this.basket);
    const body = this.basket.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    // A slim catch-zone near the opening of the basket, so items must land in it.
    body.setSize(64, 34);
    body.setOffset((this.basket.width - 64) / 2, 6);
  }

  private setupInput(): void {
    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    // Stop the arrow keys from also scrolling the page.
    kb.addCapture([
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.D,
    ]);

    // Touch / mouse: the basket follows the pointer's x position.
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.gameOver) this.targetX = p.x;
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.gameOver) this.targetX = p.x;
    });
  }

  private spawnItem(): void {
    const def = Phaser.Utils.Array.GetRandom(this.topic.items) as Item;
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const item = this.add.text(x, -40, def.emoji, { fontSize: '44px' }).setOrigin(0.5);
    item.setData('correct', def.correct);
    item.setData('label', def.label);
    this.items.add(item);
    const body = item.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityY(this.currentFallSpeed);
  }

  // Arrow function so `this` stays bound when Phaser invokes it on overlap.
  private handleCatch: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_basket, itemObj) => {
    if (this.gameOver) return;
    const item = itemObj as Phaser.GameObjects.Text;
    const correct = item.getData('correct') === true;
    const x = item.x;
    const y = item.y;
    item.destroy();

    if (correct) {
      registerCorrectCatch(this.stats);
      this.ctx.sfx.correct();
      this.showPopup(x, y, '+10 ✓', theme.correct);
      this.ctx.overlay.flashFeedback(this.topic.feedback.correct, true);
    } else {
      registerWrongCatch(this.stats);
      this.ctx.sfx.wrong();
      this.showPopup(x, y, '−1 ✗', theme.wrong);
      this.ctx.overlay.flashFeedback(this.topic.feedback.wrong, false);
    }

    this.ctx.overlay.setScore(this.stats.score);
    this.ctx.overlay.setLives(this.stats.lives);
    if (isGameOver(this.stats)) this.endGame(false);
  };

  private startRound(index: number): void {
    this.roundIndex = index;
    const cfg = ROUNDS[index];
    this.currentFallSpeed = cfg.fallSpeed;
    this.ctx.overlay.setRound(cfg.label);
    this.announce(cfg.label);

    this.spawnTimer?.remove();
    this.spawnTimer = this.time.addEvent({
      delay: cfg.spawnEveryMs,
      loop: true,
      callback: this.spawnItem,
      callbackScope: this,
    });

    this.roundTimer?.remove();
    this.roundTimer = this.time.delayedCall(cfg.durationMs, () => this.endRound());
  }

  private endRound(): void {
    if (this.gameOver) return;
    this.spawnTimer?.remove();
    const next = this.roundIndex + 1;
    // A short breather between rounds (and before the win screen).
    this.time.delayedCall(700, () => {
      if (this.gameOver) return;
      if (next < ROUNDS.length) this.startRound(next);
      else this.endGame(true);
    });
  }

  private endGame(cleared: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.spawnTimer?.remove();
    this.roundTimer?.remove();
    // Freeze anything still falling.
    for (const child of this.items.getChildren()) {
      (child.body as Phaser.Physics.Arcade.Body).setVelocityY(0);
    }
    const result = computeResult(this.stats, cleared);
    this.ctx.overlay.showSummary(result);
    if (cleared && this.stats.lives > 0) this.ctx.overlay.celebrate();
  }

  /** A brief "Round N" flourish in the centre of the canvas. */
  private announce(label: string): void {
    const text = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, label, {
        fontFamily: theme.fontStack,
        fontSize: '54px',
        color: theme.ink,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(20);
    text.setStroke(theme.inkHalo, 6);

    if (prefersReducedMotion()) {
      this.time.delayedCall(900, () => text.destroy());
      return;
    }

    text.setScale(0.6).setAlpha(0);
    this.tweens.add({
      targets: text,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'back.out(2)',
      hold: 500,
      yoyo: true,
      onComplete: () => text.destroy(),
    });
  }

  private showPopup(x: number, y: number, label: string, color: string): void {
    const text = this.add
      .text(x, y, label, {
        fontFamily: theme.fontStack,
        fontSize: '30px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(15);
    text.setStroke(theme.inkHalo, 5);
    floatScorePopup(text, () => text.destroy());
  }
}
