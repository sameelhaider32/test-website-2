/**
 * Shared motion tokens.
 *
 * Single source of truth for transition values used across the storefront.
 * Keeps animation numbers consistent and prevents magic-value scatter.
 */

/** Premium tween for shared-element image morph (product card → PDP). */
export const morphTransition = {
  type: "tween" as const,
  ease: [0.4, 0, 0.2, 1] as readonly [number, number, number, number],
  duration: 0.35,
};
