/**
 * Blackout's root layout.
 * Defines the layout shared across all pages.
 */

import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";

import MotionProvider from "./MotionProvider";

import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Blackout",
  description: "Create blackout poetry",
};

/**
 * Renders the shared layout for all pages.
 *
 * @param children - The content displayed inside the layout.
 * @returns The root layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>
        <MotionProvider>
          <Navbar />
          {children}
        </MotionProvider>
      </body>
    </html>
  );
}
