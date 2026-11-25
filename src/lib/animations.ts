/**
 * Defines shared animation settings for Blackout.
 * Ensures consistent animations across the application.
 */

import type { MotionProps } from "motion/react";

/**
 * Provides consistent hover and press animations for buttons.
 * Skips animations when a button is disabled.
 *
 * @param disabled - Whether the button is disabled.
 * @returns The button animation settings.
 */
export function buttonAnimation(disabled = false): MotionProps {
  return {
    whileHover: disabled ? undefined : { scale: 1.03 },
    whileTap: disabled ? undefined : { scale: 0.97 },
    transition: { duration: 0.15 },
  };
}
