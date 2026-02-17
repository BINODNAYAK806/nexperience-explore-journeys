import jsPDF from "jspdf";
import { format } from "date-fns";

interface QuotationForPDF {
  client_name: string;
  client_contact?: string;
  destination_name: string;
  total_price: number;
  travel_start_date: string;
  travel_end_date?: string;
  description: string;
  days: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
}

const BRAND_COLOR: [number, number, number] = [0, 102, 204];
const DARK: [number, number, number] = [33, 33, 33];
const GRAY: [number, number, number] = [120, 120, 120];
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

function addHeader(doc: jsPDF) {
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("NEXYATRA", MARGIN, 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Travel Experiences", PAGE_W - MARGIN, 12, { align: "right" });
}

function addWatermark(doc: jsPDF) {
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(50);
  doc.setFont("helvetica", "bold");
  const gState = (doc as any).GState({ opacity: 0.08 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  doc.text("NEXYATRA", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, PAGE_H - 18, PAGE_W - MARGIN, PAGE_H - 18);
  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Nexyatra · www.nexyatra.in · contact@nexyatra.in · +91 9876543210", MARGIN, PAGE_H - 12);
  doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 12, { align: "right" });
}

function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 25) {
    doc.addPage();
    addHeader(doc);
    addWatermark(doc);
    return 28;
  }
  return y;
}

export function generateQuotationPDF(data: QuotationForPDF) {
  const doc = new jsPDF("p", "mm", "a4");
  let totalPages = 1;

  // Cover Page
  addHeader(doc);
  addWatermark(doc);

  let y = 50;
  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Travel Quotation", MARGIN, y);

  y += 18;
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text(data.destination_name, MARGIN, y);

  y += 16;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);

  const infoLines = [
    `Client: ${data.client_name}`,
    data.client_contact ? `Contact: ${data.client_contact}` : "",
    `Travel Date: ${data.travel_start_date ? format(new Date(data.travel_start_date), "dd MMM yyyy") : "TBD"}${data.travel_end_date ? ` — ${format(new Date(data.travel_end_date), "dd MMM yyyy")}` : ""}`,
    `Total Price: ₹${data.total_price.toLocaleString("en-IN")}`,
  ].filter(Boolean);

  infoLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 7;
  });

  if (data.description) {
    y += 6;
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(data.description, CONTENT_W);
    descLines.forEach((line: string) => {
      y = checkPage(doc, y, 6);
      doc.text(line, MARGIN, y);
      y += 5;
    });
  }

  // Itinerary
  if (data.days.length > 0) {
    doc.addPage();
    totalPages++;
    addHeader(doc);
    addWatermark(doc);
    y = 28;

    doc.setTextColor(...BRAND_COLOR);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Day-by-Day Itinerary", MARGIN, y);
    y += 10;

    data.days.forEach((day) => {
      y = checkPage(doc, y, 20);

      doc.setFillColor(240, 245, 255);
      doc.roundedRect(MARGIN, y - 4, CONTENT_W, 8, 1, 1, "F");
      doc.setTextColor(...BRAND_COLOR);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}: ${day.title}`, MARGIN + 3, y + 1);
      y += 8;

      if (day.description) {
        doc.setTextColor(...DARK);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(day.description, CONTENT_W - 6);
        lines.forEach((line: string) => {
          y = checkPage(doc, y, 5);
          doc.text(line, MARGIN + 3, y);
          y += 4.5;
        });
      }
      y += 4;
    });
  }

  // Inclusions & Exclusions
  const addSection = (title: string, items: string[], color: [number, number, number]) => {
    if (items.length === 0) return;
    y = checkPage(doc, y, 20);
    doc.setTextColor(...color);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, MARGIN, y);
    y += 7;
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      y = checkPage(doc, y, 5);
      doc.text(`• ${item}`, MARGIN + 4, y);
      y += 5;
    });
    y += 4;
  };

  if (data.inclusions.length || data.exclusions.length) {
    doc.addPage();
    totalPages++;
    addHeader(doc);
    addWatermark(doc);
    y = 28;
    addSection("Inclusions", data.inclusions, [0, 153, 51]);
    addSection("Exclusions", data.exclusions, [204, 0, 0]);
  }

  // Add footers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages);
  }

  doc.save(`Quotation_${data.client_name.replace(/\s+/g, "_")}_${data.destination_name.replace(/\s+/g, "_")}.pdf`);
}
