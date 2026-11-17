/**
 * Blackout's root layout.
 * Defines the layout shared across all pages, including the header, homepage link, and authentication button.
 */

import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import Link from "next/link";

import AuthButton from "@/components/AuthButton";

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
 * @returns The root layout JSX.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>
        <header className="site-header">
          <Link href="/" className="site-title">
            <span className="marked-word">black</span>out
          </Link>

          <AuthButton />
        </header>

        {children}
      </body>
    </html>
  );
}
