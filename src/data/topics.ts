/**
 * ⭐ THE ONLY FILE YOU NEED TO EDIT TO CHANGE THE GAME'S CONTENT ⭐
 *
 * Everything the player sees — categories, items, instructions, feedback and
 * difficulty — is data. The game engine (src/game/*) reads this file and knows
 * nothing about animals or shapes specifically. To ship a new subject, add a
 * Topic to the TOPICS array below. A copy-paste example is at the bottom.
 */
import type { RoundConfig, Topic } from '../core/types';

/**
 * The difficulty curve, shared by every topic. Each entry is one round, and the
 * game speeds up as it moves down the list (shorter spawn gap + faster fall).
 * Add or remove entries to make the game longer, shorter, easier or harder.
 */
export const ROUNDS: RoundConfig[] = [
  { label: 'Round 1', durationMs: 22000, spawnEveryMs: 1100, fallSpeed: 150 },
  { label: 'Round 2', durationMs: 24000, spawnEveryMs: 850, fallSpeed: 205 },
  { label: 'Round 3', durationMs: 26000, spawnEveryMs: 650, fallSpeed: 265 },
];

export const TOPICS: Topic[] = [
  {
    id: 'animals',
    title: 'Animals',
    icon: '🐢',
    prompt: 'Catch the animals — leave everything else!',
    targetLabel: 'Animals',
    avoidLabel: 'Not animals',
    items: [
      { emoji: '🐢', label: 'turtle', correct: true },
      { emoji: '🐘', label: 'elephant', correct: true },
      { emoji: '🦋', label: 'butterfly', correct: true },
      { emoji: '🐬', label: 'dolphin', correct: true },
      { emoji: '🦉', label: 'owl', correct: true },
      { emoji: '🐝', label: 'bee', correct: true },
      { emoji: '🐙', label: 'octopus', correct: true },
      { emoji: '🐸', label: 'frog', correct: true },
      { emoji: '🌵', label: 'cactus', correct: false },
      { emoji: '🍄', label: 'mushroom', correct: false },
      { emoji: '🌻', label: 'sunflower', correct: false },
      { emoji: '🪨', label: 'rock', correct: false },
      { emoji: '🚗', label: 'car', correct: false },
      { emoji: '🎸', label: 'guitar', correct: false },
    ],
    feedback: {
      correct: 'Yes! That is an animal.',
      wrong: 'That one is not an animal — let it fall next time!',
    },
  },
  {
    id: 'healthy-foods',
    title: 'Healthy Foods',
    icon: '🍎',
    prompt: 'Catch the healthy foods — let the sometimes-foods go by!',
    targetLabel: 'Healthy foods',
    avoidLabel: 'Sometimes foods',
    items: [
      { emoji: '🍎', label: 'apple', correct: true },
      { emoji: '🥦', label: 'broccoli', correct: true },
      { emoji: '🥕', label: 'carrot', correct: true },
      { emoji: '🍌', label: 'banana', correct: true },
      { emoji: '🫐', label: 'blueberries', correct: true },
      { emoji: '🥚', label: 'egg', correct: true },
      { emoji: '🐟', label: 'fish', correct: true },
      { emoji: '🍩', label: 'donut', correct: false },
      { emoji: '🍰', label: 'cake', correct: false },
      { emoji: '🍟', label: 'fries', correct: false },
      { emoji: '🍭', label: 'lollipop', correct: false },
      { emoji: '🥤', label: 'fizzy drink', correct: false },
      { emoji: '🍫', label: 'chocolate bar', correct: false },
    ],
    feedback: {
      correct: 'Great choice — that is a healthy food!',
      wrong: 'That is a sometimes-food. Tasty, but not this round!',
    },
  },
  {
    id: 'shapes',
    title: 'Round Shapes',
    icon: '🔵',
    prompt: 'Catch the round shapes — avoid the ones with corners!',
    targetLabel: 'Round shapes (circles)',
    avoidLabel: 'Shapes with corners',
    items: [
      { emoji: '🔴', label: 'red circle', correct: true },
      { emoji: '🔵', label: 'blue circle', correct: true },
      { emoji: '🟢', label: 'green circle', correct: true },
      { emoji: '🟡', label: 'yellow circle', correct: true },
      { emoji: '🟣', label: 'purple circle', correct: true },
      { emoji: '🟠', label: 'orange circle', correct: true },
      { emoji: '⚪', label: 'white circle', correct: true },
      { emoji: '🔺', label: 'triangle', correct: false },
      { emoji: '🟥', label: 'red square', correct: false },
      { emoji: '🟦', label: 'blue square', correct: false },
      { emoji: '🔶', label: 'orange diamond', correct: false },
      { emoji: '⭐', label: 'star', correct: false },
      { emoji: '🟨', label: 'yellow square', correct: false },
    ],
    feedback: {
      correct: 'Nice — a circle is a round shape!',
      wrong: 'That shape has corners. Only round shapes this round!',
    },
  },
];

/** Look up a topic by id, falling back to the first topic if the id is unknown. */
export function getTopic(id: string): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

/*
 * ───────────────────────────────────────────────────────────────────────────
 *  HOW TO ADD A NEW TOPIC
 * ───────────────────────────────────────────────────────────────────────────
 *  Copy the block below into the TOPICS array above, uncomment it, and edit the
 *  values. No other file needs to change — the menu button, gameplay, HUD label
 *  and feedback are all generated from this data.
 *
 *  Tips:
 *   • Aim for 6–8 "correct" items and 5–7 distractors so rounds feel fair.
 *   • Pick distractors clearly in a different category, and give every item a
 *     plain-language `label` so feedback never relies on colour alone.
 *   • `icon` is just decoration for the menu button.
 *
 *  {
 *    id: 'planets',                    // unique, lowercase, no spaces
 *    title: 'Planets',                 // shown on the menu button
 *    icon: '🪐',
 *    prompt: 'Catch the planets — dodge the space junk!',
 *    targetLabel: 'Planets',
 *    avoidLabel: 'Not planets',
 *    items: [
 *      { emoji: '🌍', label: 'Earth',     correct: true },
 *      { emoji: '🪐', label: 'Saturn',    correct: true },
 *      { emoji: '🔴', label: 'Mars',      correct: true },
 *      { emoji: '☄️', label: 'comet',     correct: false },
 *      { emoji: '🛰️', label: 'satellite', correct: false },
 *      { emoji: '🚀', label: 'rocket',    correct: false },
 *    ],
 *    feedback: {
 *      correct: 'Yes — that is a planet!',
 *      wrong: 'Not a planet. Let that one drift past!',
 *    },
 *  },
 */
