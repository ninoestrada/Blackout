/**
 * Exports a blackout poem as a PNG image.
 */

import html2canvas from "html2canvas";
import styles from "../page.module.css";

type ExportPoemOptions = {
  poemElement: HTMLDivElement;
  title: string;
};

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

      if (clonedPoem) {
        const poemBounds = poemElement.getBoundingClientRect();

        clonedPoem.setAttribute(
          "style",
          `box-sizing: content-box; width: ${poemBounds.width}px; padding: 64px 64px 80px;`,
        );
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

  const filename =
    title
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
      .replace(/[. ]+$/g, "") || "blackout-poem";

  const downloadLink = document.createElement("a");

  downloadLink.download = `${filename}.png`;
  downloadLink.href = canvas.toDataURL("image/png");

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
}
