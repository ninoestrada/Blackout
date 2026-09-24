import Link from "next/link";
import { Space_Mono, Victor_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const victorMono = Victor_Mono({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

export default function Home() {
  return (
    <main className="landing">
      <header className="landing-header">
        <div className={`site-title ${spaceMono.className}`}>
          <span className="marked-word">black</span>out
        </div>

        <button className={`landing-button ${spaceMono.className}`}>
          Sign in
        </button>
      </header>

      <section className="landing-content">
        <h1 className={spaceMono.className}>
          Start blackout
          <br />
          poetry. <u className="here-text">Here.</u>
        </h1>

        <p>
          This workspace lets you take any text,
          <br />
          remove what you don&apos;t want,
          <br />
          and reveal what was there all along.
        </p>

        <div className="landing-actions">
          <Link
            href="/studio"
            className={`landing-button ${spaceMono.className}`}
          >
            Enter Workspace
          </Link>

          <blockquote className={victorMono.className}>
            When in doubt, black it out.
            <br />— Frank Miller
          </blockquote>
        </div>
      </section>
    </main>
  );
}
