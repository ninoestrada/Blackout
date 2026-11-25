/**
 * Blackout's primary navigation link.
 * Displays a styled link with hover and press animations.
 */

"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonAnimation } from "@/lib/animations";

const MotionLink = motion.create(Link);

type PrimaryLinkProps = {
  /** The destination of the link. */
  href: string;
  /** The content displayed inside the link. */
  children: ReactNode;
};

/**
 * Renders a button that navigates to another page.
 *
 * @returns The animated navigation link.
 */
export default function PrimaryLink({ href, children }: PrimaryLinkProps) {
  return (
    <MotionLink href={href} className="primary-button" {...buttonAnimation()}>
      {children}
    </MotionLink>
  );
}
