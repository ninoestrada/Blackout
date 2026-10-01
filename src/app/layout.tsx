import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import AuthButton from "@/components/AuthButton";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Blackout",
  description: "Create blackout poetry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="landing-header">
          <div className={`site-title ${spaceMono.className}`}>
            <span className="marked-word">black</span>out
          </div>

          <AuthButton />
        </header>

        {children}
      </body>
    </html>
  );
}
