/**
 * Application entry point.
 *
 * Wires together the four pieces:
 *  • Settings + Sfx   — small plain-object services.
 *  • Overlay          — the accessible HTML UI (menus, HUD, results).
 *  • Phaser.Game      — the gameplay canvas.
 *
 * The overlay's callbacks drive the Phaser scene (start / restart / pause), and
 * the scene reaches back to the overlay through the shared GameContext we store
 * in the Phaser registry.
 */
import Phaser from 'phaser';
import './style.css';
import { createGameConfig } from './game/gameConfig';
import { Overlay } from './ui/overlay';
import { Settings } from './core/settings';
import { Sfx } from './core/audio';
import type { GameContext } from './core/context';

const uiRoot = document.getElementById('ui');
const gameRoot = document.getElementById('game');
if (!uiRoot || !gameRoot) throw new Error('Missing #ui or #game container in index.html');

const settings = new Settings();
const sfx = new Sfx(settings);

/** Remembered so "Play again" restarts the same topic. */
let lastTopicId = 'animals';

const overlay = new Overlay(uiRoot, settings, {
  onStart: (topicId) => {
    lastTopicId = topicId;
    sfx.unlock(); // this runs inside a click/tap, so audio is allowed to start
    game.scene.start('Game', { topicId });
  },
  onPlayAgain: () => {
    sfx.unlock();
    game.scene.start('Game', { topicId: lastTopicId });
  },
  onChangeTopic: () => {
    game.scene.stop('Game');
    overlay.showMenu();
  },
  onTogglePause: (paused) => {
    if (paused) game.scene.pause('Game');
    else game.scene.resume('Game');
  },
});

const game = new Phaser.Game(createGameConfig(gameRoot));

// Share the services with the scenes via the registry.
const ctx: GameContext = { overlay, settings, sfx };
game.registry.set('ctx', ctx);

overlay.mount();
overlay.showMenu();
