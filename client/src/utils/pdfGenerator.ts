import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generates a PDF blob from the invoice content.
 * @param {React.RefObject} invoiceRef
 * @returns {Promise<jsPDF>}
 */
const stripOklch = (el: HTMLElement) => {
  const style = getComputedStyle(el);
  if (style.color.includes("oklch")) el.style.color = "#000";
};
const removeOklchColors = () => {
  document.querySelectorAll<HTMLElement>("*").forEach(stripOklch);
};
export const generatePDFBlob = async (invoiceRef: any) => {
  removeOklchColors();
  const canvas = await html2canvas(invoiceRef.current, { scale: 2 });


  const imgData = canvas.toDataURL("image/png");

  const doc = new jsPDF({
    unit: "px",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const availW = pageW - margin * 2;
  const imgH = (canvas.height * availW) / canvas.width;

  doc.addImage(imgData, "PNG", margin, margin, availW, imgH);

  return doc;
};
