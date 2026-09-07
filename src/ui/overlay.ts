/**
 * The accessible HTML overlay that sits above the Phaser canvas.
 *
 * Why HTML instead of drawing menus in Phaser? Real DOM buttons and text are
 * focusable, screen-reader friendly, and easy to style responsively — a much
 * better fit for the menus, HUD and results than canvas-drawn equivalents. The
 * canvas handles the fast, visual gameplay; the overlay handles everything the
 * player reads or clicks. GSAP animates the overlay's entrances and popups.
 */
import type { GameResult } from '../core/types';
import type { Settings } from '../core/settings';
import { TOPICS } from '../data/topics';
import { accuracyPercent } from '../core/scoring';
import { celebrate, panelIn, pop } from './animations';

export interface OverlayCallbacks {
  /** Player picked a topic on the menu — start a run. */
  onStart: (topicId: string) => void;
  /** Player pressed "Play again" — restart the same topic. */
  onPlayAgain: () => void;
  /** Player pressed "Choose another topic" — return to the menu. */
  onChangeTopic: () => void;
  /** Pause toggled — the host pauses/resumes the Phaser scene. */
  onTogglePause: (paused: boolean) => void;
}

type Mode = 'menu' | 'playing' | 'paused' | 'summary';

export class Overlay {
  private mode: Mode = 'menu';
  private toastTimer = 0;

  // Cached element references, filled in mount().
  private hud!: HTMLElement;
  private scoreEl!: HTMLElement;
  private roundEl!: HTMLElement;
  private goalCatchEl!: HTMLElement;
  private goalAvoidEl!: HTMLElement;
  private livesEl!: HTMLElement;
  private pauseBtn!: HTMLButtonElement;
  private muteBtn!: HTMLButtonElement;
  private toastEl!: HTMLElement;
  private menuEl!: HTMLElement;
  private summaryEl!: HTMLElement;
  private pausedEl!: HTMLElement;
  private confettiEl!: HTMLElement;
  private summaryTitleEl!: HTMLElement;
  private summaryScoreEl!: HTMLElement;
  private summaryAccuracyEl!: HTMLElement;
  private bdCorrectEl!: HTMLElement;
  private bdWrongEl!: HTMLElement;
  private bdMissedEl!: HTMLElement;

  constructor(
    private root: HTMLElement,
    private settings: Settings,
    private cb: OverlayCallbacks,
  ) {}

  /** Build the overlay DOM and wire up all the controls. Call once at startup. */
  mount(): void {
    this.root.innerHTML = TEMPLATE;

    this.hud = this.qs('#hud');
    this.scoreEl = this.qs('#score');
    this.roundEl = this.qs('#round');
    this.goalCatchEl = this.qs('#goal-catch');
    this.goalAvoidEl = this.qs('#goal-avoid');
    this.livesEl = this.qs('#lives');
    this.pauseBtn = this.qs<HTMLButtonElement>('#btn-pause');
    this.muteBtn = this.qs<HTMLButtonElement>('#btn-mute');
    this.toastEl = this.qs('#toast');
    this.menuEl = this.qs('#menu');
    this.summaryEl = this.qs('#summary');
    this.pausedEl = this.qs('#paused');
    this.confettiEl = this.qs('#confetti');
    this.summaryTitleEl = this.qs('#summary-title');
    this.summaryScoreEl = this.qs('#summary-score');
    this.summaryAccuracyEl = this.qs('#summary-accuracy');
    this.bdCorrectEl = this.qs('#bd-correct');
    this.bdWrongEl = this.qs('#bd-wrong');
    this.bdMissedEl = this.qs('#bd-missed');

    this.buildTopicButtons();
    this.wireControls();
    this.refreshMuteButton();
  }

  // ── Screen navigation ─────────────────────────────────────────────────────

  showMenu(): void {
    this.mode = 'menu';
    this.hide(this.hud);
    this.hide(this.summaryEl);
    this.hide(this.pausedEl);
    this.hide(this.toastEl);
    this.show(this.menuEl);
    panelIn(this.menuEl.querySelector('.card')!);
    this.focusFirst(this.menuEl);
  }

  private startGame(topicId: string): void {
    this.mode = 'playing';
    this.hide(this.menuEl);
    this.hide(this.summaryEl);
    this.hide(this.pausedEl);
    this.show(this.hud);
    this.setPauseButton(false);
    this.cb.onStart(topicId);
  }

  // ── HUD updates (called from the game scene) ──────────────────────────────

  setScore(value: number): void {
    this.scoreEl.textContent = String(value);
    pop(this.scoreEl);
  }

  setLives(lives: number): void {
    const hearts = '❤️'.repeat(Math.max(0, lives));
    this.livesEl.textContent = hearts || '—';
    this.livesEl.setAttribute('aria-label', `${lives} ${lives === 1 ? 'life' : 'lives'} left`);
  }

  setRound(label: string): void {
    this.roundEl.textContent = label;
  }

  setTarget(target: string, avoid: string): void {
    this.goalCatchEl.textContent = `Catch: ${target}`;
    this.goalAvoidEl.textContent = `Avoid: ${avoid}`;
  }

  /** A short encouraging message. The ✓ / ✗ prefix means it never relies on colour. */
  flashFeedback(message: string, positive: boolean): void {
    this.toastEl.textContent = `${positive ? '✓' : '✗'} ${message}`;
    this.toastEl.classList.toggle('toast--good', positive);
    this.toastEl.classList.toggle('toast--bad', !positive);
    this.show(this.toastEl);
    pop(this.toastEl);
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.hide(this.toastEl), 1400);
  }

  // ── Results ───────────────────────────────────────────────────────────────

  showSummary(result: GameResult): void {
    this.mode = 'summary';
    this.hide(this.toastEl);
    this.hide(this.hud);
    this.summaryTitleEl.textContent = result.cleared
      ? 'You cleared every round! 🎉'
      : 'Out of lives!';
    this.summaryScoreEl.textContent = String(result.score);
    this.summaryAccuracyEl.textContent = `Accuracy: ${accuracyPercent(result.accuracy)}%`;
    this.bdCorrectEl.textContent = String(result.correctCatches);
    this.bdWrongEl.textContent = String(result.wrongCatches);
    this.bdMissedEl.textContent = String(result.missedTargets);
    this.show(this.summaryEl);
    panelIn(this.summaryEl.querySelector('.card')!);
    this.focusFirst(this.summaryEl);
  }

  /** Fire the win celebration (confetti burst). Skipped under reduced motion. */
  celebrate(): void {
    celebrate(this.confettiEl);
  }

  // ── Pause / mute ──────────────────────────────────────────────────────────

  private togglePause(): void {
    if (this.mode === 'playing') {
      this.mode = 'paused';
      this.settings.paused = true;
      this.show(this.pausedEl);
      this.setPauseButton(true);
      this.cb.onTogglePause(true);
      this.focusFirst(this.pausedEl);
    } else if (this.mode === 'paused') {
      this.mode = 'playing';
      this.settings.paused = false;
      this.hide(this.pausedEl);
      this.setPauseButton(false);
      this.cb.onTogglePause(false);
    }
  }

  private toggleMute(): void {
    this.settings.muted = !this.settings.muted;
    this.refreshMuteButton();
  }

  // ── Wiring & helpers ──────────────────────────────────────────────────────

  private wireControls(): void {
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.muteBtn.addEventListener('click', () => this.toggleMute());
    this.qs<HTMLButtonElement>('#btn-again').addEventListener('click', () => {
      this.mode = 'playing';
      this.hide(this.summaryEl);
      this.show(this.hud);
      this.setPauseButton(false);
      this.cb.onPlayAgain();
    });
    this.qs<HTMLButtonElement>('#btn-topics').addEventListener('click', () => {
      this.cb.onChangeTopic();
    });
    this.qs<HTMLButtonElement>('#btn-resume').addEventListener('click', () => this.togglePause());

    // Keyboard shortcuts live on the document so they work even while the Phaser
    // scene is paused (a paused scene stops receiving its own input).
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'm') {
        this.toggleMute();
      } else if (key === 'p' || key === 'escape') {
        if (this.mode === 'playing' || this.mode === 'paused') {
          e.preventDefault();
          this.togglePause();
        }
      }
    });
  }

  private buildTopicButtons(): void {
    const host = this.qs('#topics');
    for (const topic of TOPICS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'topic';
      btn.innerHTML = `<span class="topic__icon" aria-hidden="true">${topic.icon}</span><span class="topic__name">${topic.title}</span>`;
      btn.setAttribute('aria-label', `Play ${topic.title}`);
      btn.addEventListener('click', () => this.startGame(topic.id));
      host.appendChild(btn);
    }
  }

  private setPauseButton(paused: boolean): void {
    this.pauseBtn.textContent = paused ? '▶' : '⏸';
    this.pauseBtn.setAttribute('aria-label', paused ? 'Resume' : 'Pause');
  }

  private refreshMuteButton(): void {
    const muted = this.settings.muted;
    this.muteBtn.textContent = muted ? '🔇' : '🔊';
    this.muteBtn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
    this.muteBtn.setAttribute('aria-pressed', String(muted));
  }

  private show(el: HTMLElement): void {
    el.hidden = false;
  }

  private hide(el: HTMLElement): void {
    el.hidden = true;
  }

  private focusFirst(container: HTMLElement): void {
    const focusable = container.querySelector<HTMLElement>('button, [tabindex]');
    focusable?.focus();
  }

  private qs<T extends HTMLElement = HTMLElement>(selector: string): T {
    const el = this.root.querySelector<T>(selector);
    if (!el) throw new Error(`Overlay element not found: ${selector}`);
    return el;
  }
}

const TEMPLATE = /* html */ `
  <div class="hud" id="hud" hidden>
    <div class="hud__left">
      <div class="stat"><span class="stat__label">Score</span><span class="stat__value" id="score">0</span></div>
    </div>
    <div class="hud__center">
      <div class="round" id="round">Round 1</div>
      <div class="goal">
        <span class="goal__catch" id="goal-catch">Catch: …</span>
        <span class="goal__avoid" id="goal-avoid">Avoid: …</span>
      </div>
    </div>
    <div class="hud__right">
      <div class="stat stat--lives">
        <span class="stat__label">Lives</span>
        <span class="hearts" id="lives" aria-label="3 lives left">❤️❤️❤️</span>
      </div>
      <button class="iconbtn" id="btn-pause" type="button" aria-label="Pause">⏸</button>
      <button class="iconbtn" id="btn-mute" type="button" aria-label="Mute sound" aria-pressed="false">🔊</button>
    </div>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>

  <div class="screen" id="menu" hidden>
    <div class="card">
      <h1 class="title">Catch the Living Things</h1>
      <p class="lede">Slide the basket to catch the right things and skip the rest. Use the <b>arrow keys</b> or <b>drag</b> on a touchscreen. Three rounds — and it speeds up! Pick a topic to start:</p>
      <div class="topics" id="topics"></div>
    </div>
  </div>

  <div class="screen" id="summary" hidden>
    <div class="card">
      <div class="confetti" id="confetti" aria-hidden="true"></div>
      <h2 class="title" id="summary-title">Out of lives!</h2>
      <div class="bigscore"><span id="summary-score">0</span><span class="bigscore__unit">points</span></div>
      <div class="accuracy" id="summary-accuracy">Accuracy: 0%</div>
      <ul class="breakdown">
        <li><span class="bd-icon" aria-hidden="true">✓</span> Correct catches: <b id="bd-correct">0</b></li>
        <li><span class="bd-icon" aria-hidden="true">✗</span> Wrong catches: <b id="bd-wrong">0</b></li>
        <li><span class="bd-icon" aria-hidden="true">↓</span> Targets missed: <b id="bd-missed">0</b></li>
      </ul>
      <div class="actions">
        <button class="btn btn--primary" id="btn-again" type="button">Play again</button>
        <button class="btn" id="btn-topics" type="button">Choose another topic</button>
      </div>
    </div>
  </div>

  <div class="screen screen--dim" id="paused" hidden>
    <div class="card card--small">
      <h2 class="title">Paused</h2>
      <button class="btn btn--primary" id="btn-resume" type="button">Resume</button>
    </div>
  </div>
`;
