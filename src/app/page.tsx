import Link from "next/link";
import { Victor_Mono } from "next/font/google";

const victorMono = Victor_Mono({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

export default function Home() {
  return (
    <main className="landing">
      <section className="landing-content">
        <h1>
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
          <Link href="/studio" className="landing-button">
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
