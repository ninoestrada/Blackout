/**
 * Blackout's Motion provider.
 * Manages animation settings across the application.
 */

"use client";

import type { ReactNode } from "react";

import { MotionConfig } from "motion/react";

/**
 * Configures animations based on the user's motion preferences.
 *
 * @param children - The components inside the provider.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
