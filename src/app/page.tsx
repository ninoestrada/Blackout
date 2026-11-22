/**
 * Blackout's homepage.
 * Displays the landing page with an introduction and a link to the workspace.
 */

import { Victor_Mono } from "next/font/google";
import Link from "next/link";

import styles from "./page.module.css";

const victorMono = Victor_Mono({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
});

/**
 * Renders the homepage with an introduction and a link to the workspace.
 *
 * @returns The homepage.
 */
export default function Home() {
  return (
    <main className={styles.landing}>
      <section className={styles["landing-content"]}>
        <h1>
          Start blackout
          <br />
          poetry. <u>Here.</u>
        </h1>

        <p>
          This workspace lets you take any text,
          <br />
          remove what you don&apos;t want,
          <br />
          and reveal what was there all along.
        </p>

        <div className={styles["landing-actions"]}>
          <Link href="/studio" className="primary-button">
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
