import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const removeOklchColors = () => {
  document.querySelectorAll("*").forEach((el) => {
    const style = getComputedStyle(el);
    if (style.backgroundColor?.includes("oklch")) {
      (el as HTMLElement).style.backgroundColor = "#ffffff";
    }
    if (style.color?.includes("oklch")) {
      (el as HTMLElement).style.color = "#000000";
    }
    if (style.borderColor?.includes("oklch")) {
      (el as HTMLElement).style.borderColor = "#e5e7eb";
    }
  });
};

export const generatePDFBlob = async (
  ref: React.RefObject<HTMLDivElement>
): Promise<jsPDF> => {
  removeOklchColors();
  const canvas = await html2canvas(ref.current!, { scale: 2 });
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
