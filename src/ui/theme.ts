/**
 * Visual design tokens used by the canvas (Phaser) side of the game. The HTML
 * overlay mirrors these in src/style.css — keep the two in sync.
 *
 * Palette: a bright "sunny sky + candy" scheme chosen for a young audience. Every
 * status colour is always paired with an icon or words elsewhere, so nothing
 * relies on colour alone (an accessibility requirement).
 */
export const theme = {
  // Canvas sky gradient (top → bottom).
  skyTop: '#8fd6ff',
  skyBottom: '#d6f5ec',
  // Canvas text is dark with a light halo so it stays legible over the sky.
  ink: '#10233b',
  inkHalo: '#ffffff',
  // Status accents (shared with the overlay).
  correct: '#1f9d55', // green — always shown with a ✓ and words
  wrong: '#d63b3b', // red — always shown with a ✗ and words
  gold: '#f5a623', // score / celebration
  fontStack:
    '"Segoe UI Rounded", "SF Pro Rounded", ui-rounded, "Nunito", "Trebuchet MS", system-ui, sans-serif',
} as const;
