/**
 * The internal "design resolution". Everything is laid out against this fixed
 * 800×600 canvas; Phaser's Scale.FIT then scales it up or down to fill whatever
 * screen it runs on (phone, tablet, Chromebook, desktop) while keeping the ratio.
 *
 * Kept in its own tiny module so both gameConfig and the scenes can import it
 * without creating an import cycle.
 */
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
