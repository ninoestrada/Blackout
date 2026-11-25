/**
 * Manages Blackout's poem exports.
 * Prepares the poem as a PNG image and downloads it.
 */

import html2canvas from "html2canvas";

import styles from "../page.module.css";

type ExportPoemOptions = {
  /** The HTML element containing the poem to export. */
  poemElement: HTMLDivElement;
  /** The poem's title, displayed in the image and used as the filename. */
  title: string;
};

/**
 * Prepares the poem as a PNG image and downloads it.
 */
export default async function exportPoem({
  poemElement,
  title,
}: ExportPoemOptions): Promise<void> {
  await document.fonts?.ready;

  const backgroundColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-background")
      .trim() || "#f0f0f0";

  const canvas = await html2canvas(poemElement, {
    backgroundColor,
    scale: 2,
    onclone: (clonedDocument) => {
      const clonedPoem = clonedDocument.querySelector("[data-poem-export]");
      const titleInput = clonedPoem?.querySelector("input");

      // Adjust the poem's layout for export.
      if (clonedPoem) {
        const poemRect = poemElement.getBoundingClientRect();

        clonedPoem.setAttribute(
          "style",
          `box-sizing: content-box; width: ${poemRect.width}px; padding: 64px 64px 80px;`,
        );

        // Prevent word animations from affecting the exported image.
        clonedPoem
          .querySelectorAll<HTMLElement>(`.${styles.passage} span`)
          .forEach((word) => {
            word.style.transition = "none";
          });
      }

      if (clonedPoem && titleInput) {
        const exportedTitle = clonedDocument.createElement("h1");

        exportedTitle.className = styles.poemExportTitle;
        exportedTitle.textContent = title.trim() || "Untitled";

        titleInput.replaceWith(exportedTitle);
      }

      clonedPoem?.querySelector("[data-poem-ignore]")?.remove();
    },
  });

  // Replace invalid characters in the filename.
  const fileName =
    title
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/[. ]+$/g, "") || "blackout-poem";

  const downloadLink = document.createElement("a");

  downloadLink.download = `${fileName}.png`;
  downloadLink.href = canvas.toDataURL("image/png");

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}
