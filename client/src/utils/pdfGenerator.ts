// src/utils/pdfGenerator.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RefObject } from "react";

/** Strip any oklch() colors before capture */
const stripOklch = (el: HTMLElement) => {
  const style = getComputedStyle(el);
  if (style.backgroundColor.includes("oklch")) el.style.backgroundColor = "#fff";
  if (style.color.includes("oklch")) el.style.color = "#000";
  if (style.borderColor.includes("oklch")) el.style.borderColor = "#e5e7eb";
};
const removeOklchColors = () => {
  document.querySelectorAll<HTMLElement>("*").forEach(stripOklch);
};

export async function generatePDFBlob(
  ref: RefObject<HTMLDivElement>
): Promise<jsPDF> {
  if (!ref.current) throw new Error("Invoice element not found");
  const invoiceEl = ref.current;

  if (!invoiceEl.id) {
    invoiceEl.id = `invoice-clone-${Date.now()}`;
  }

  // 1) Sanitize any oklch() colors
  removeOklchColors();

  // 2) Allow Tailwind & webfonts a moment to load
  await new Promise((r) => setTimeout(r, 200));

  // 3) Scroll it fully into view
  invoiceEl.scrollIntoView({ block: "start" });

  // 4) Capture at 2× resolution, injecting styling tweaks in the clone
  const canvas = await html2canvas(invoiceEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    onclone: (doc) => {
      const container = doc.getElementById(invoiceEl.id!);
      if (!container) return;

      // a) Paragraph spacing
      container
        .querySelectorAll<HTMLParagraphElement>("p")
        .forEach((p) => {
          p.style.marginBottom = "4px";
          p.style.lineHeight = "1.4";
        });

      // b) Center all table headers
      container
        .querySelectorAll<HTMLTableHeaderCellElement>("thead th")
        .forEach((th) => {
          th.style.textAlign = "center";
        });

      // c) Footer cells padding
      container
        .querySelectorAll<HTMLElement>("tfoot td")
        .forEach((td) => {
          td.style.paddingTop = "8px";
          td.style.paddingBottom = "8px";
        });

      // d) Prevent bottom-border clipping — increase to 30px
      container.style.paddingBottom = "30px";

      // e) Company-info block margin
      container
        .querySelectorAll<HTMLElement>("div.text-xs.leading-snug.space-y-1")
        .forEach((div) => {
          div.style.marginBottom = "12px";
        });

      // f) Ensure list bullets render with extra space
      container
        .querySelectorAll<HTMLUListElement>("ul.list-disc")
        .forEach((ul) => {
          ul.style.listStyleType = "disc";
          ul.style.listStylePosition = "inside";
          ul.style.paddingLeft = "12px";
        });
      container
        .querySelectorAll<HTMLLIElement>("ul.list-disc li")
        .forEach((li) => {
          li.style.marginLeft = "6px";
        });

      // g) Align all flex-based lines and normalize bullets
      container.querySelectorAll<HTMLElement>("p.flex").forEach((p) => {
        p.style.display = "flex";
        p.style.alignItems = "center";    // vertical center
      });
      container
    .querySelectorAll<HTMLElement>("span.w-1.h-1.rounded-full")
    .forEach((span) => {
      span.style.marginTop = "12px";         // push the dot down
      span.style.marginRight = "6px";
    });

      // h) Fix “E. & O.E.” footer and add bottom margin
      container
        .querySelectorAll<HTMLElement>(".col-span-2.border-t")
        .forEach((div) => {
          if (div.textContent?.trim().startsWith("E")) {
            div.textContent = "E. & O.E.";
          }
          div.style.marginBottom = "12px";  // space from bottom edge
        });

      // i) Adjust logo height
      const logo = container.querySelector<HTMLImageElement>(
        'img[alt="InfoGentech Logo"]'
      );
      if (logo) {
        logo.style.height = "18mm";
        logo.style.width = "auto";
      }
    },
  });

  // 5) Get clean base64 JPEG
  const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
  const base64 = dataUrl.split(",")[1];

  // 6) Create A4 PDF in mm
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;

  // Compute image dimensions
  let imgW = availW;
  let imgH = (canvas.height * imgW) / canvas.width;
  if (imgH > availH) {
    const scale = availH / imgH;
    imgH = availH;
    imgW = imgW * scale;
  }

  const offsetX = margin + (availW - imgW) / 2;
  const offsetY = margin;

  // 7) Draw the image
  pdf.addImage(base64, "JPEG", offsetX, offsetY, imgW, imgH, undefined, "FAST");
  return pdf;
}
