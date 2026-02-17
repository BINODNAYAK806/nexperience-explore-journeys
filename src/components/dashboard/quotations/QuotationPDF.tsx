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

const BRAND_BLUE: [number, number, number] = [0, 82, 165];
const BRAND_ORANGE: [number, number, number] = [230, 126, 34];
const DARK: [number, number, number] = [33, 33, 33];
const GRAY: [number, number, number] = [100, 100, 100];
const LIGHT_BG: [number, number, number] = [245, 248, 255];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [39, 174, 96];
const RED: [number, number, number] = [192, 57, 43];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COMPANY_INFO = {
  name: "NexYatra",
  tagline: "Travel Experiences",
  address: "320 Exult Shoppers, Nr. Siddhi Vinayak Temple, Vesu Main Road, Vesu, Surat, Gujarat 395007",
  email: "info@nexyatra.in",
  phone: "+91 8347015725",
  website: "www.nexyatra.in",
};

async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch("/lovable-uploads/2b127b7a-f8e2-4ed9-b75a-f14f4e215484.png");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function addHeader(doc: jsPDF, logoBase64: string | null) {
  // Header background
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, PAGE_W, 32, "F");

  // Orange accent line
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(0, 32, PAGE_W, 2, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN, 4, 24, 24);
    } catch {
      // fallback text
    }
  }

  // Company name
  const textX = logoBase64 ? MARGIN + 28 : MARGIN;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, textX, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY_INFO.tagline, textX, 19);

  // Right side contact info
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const rightX = PAGE_W - MARGIN;
  doc.text(COMPANY_INFO.phone, rightX, 10, { align: "right" });
  doc.text(COMPANY_INFO.email, rightX, 15, { align: "right" });
  doc.text(COMPANY_INFO.website, rightX, 20, { align: "right" });
  
  // Address (smaller, wraps)
  doc.setFontSize(6);
  const addrLines = doc.splitTextToSize(COMPANY_INFO.address, 60);
  addrLines.forEach((line: string, i: number) => {
    doc.text(line, rightX, 25 + i * 3, { align: "right" });
  });
}

function addWatermark(doc: jsPDF, logoBase64: string | null) {
  if (logoBase64) {
    try {
      const gState = (doc as any).GState({ opacity: 0.06 });
      doc.saveGraphicsState();
      doc.setGState(gState);
      doc.addImage(logoBase64, "PNG", PAGE_W / 2 - 40, PAGE_H / 2 - 40, 80, 80);
      doc.restoreGraphicsState();
    } catch {
      // fallback text watermark
      addTextWatermark(doc);
    }
  } else {
    addTextWatermark(doc);
  }
}

function addTextWatermark(doc: jsPDF) {
  const gState = (doc as any).GState({ opacity: 0.06 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.text("NEXYATRA", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  // Orange line
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(0, PAGE_H - 20, PAGE_W, 1.5, "F");

  // Footer background
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, PAGE_H - 18.5, PAGE_W, 18.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  const footerY = PAGE_H - 10;
  doc.text(`${COMPANY_INFO.name} | ${COMPANY_INFO.phone} | ${COMPANY_INFO.email} | ${COMPANY_INFO.website}`, MARGIN, footerY);
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN, footerY, { align: "right" });
}

const HEADER_H = 38;
const FOOTER_H = 22;

function checkPage(doc: jsPDF, y: number, needed: number, logoBase64: string | null): number {
  if (y + needed > PAGE_H - FOOTER_H - 5) {
    doc.addPage();
    addHeader(doc, logoBase64);
    addWatermark(doc, logoBase64);
    return HEADER_H + 5;
  }
  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...BRAND_BLUE);
  doc.roundedRect(MARGIN, y - 5, CONTENT_W, 9, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN + 4, y + 1);
  return y + 10;
}

export async function generateQuotationPDF(data: QuotationForPDF) {
  const logoBase64 = await loadLogoBase64();
  const doc = new jsPDF("p", "mm", "a4");

  // ===== PAGE 1: Cover + Inclusions =====
  addHeader(doc, logoBase64);
  addWatermark(doc, logoBase64);

  let y = HEADER_H + 10;

  // Destination title
  doc.setTextColor(...BRAND_BLUE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.destination_name, PAGE_W / 2, y, { align: "center" });

  // Decorative line under title
  y += 4;
  doc.setDrawColor(...BRAND_ORANGE);
  doc.setLineWidth(1);
  const titleW = doc.getTextWidth(data.destination_name);
  doc.line(PAGE_W / 2 - titleW / 2, y, PAGE_W / 2 + titleW / 2, y);

  // Duration
  y += 10;
  if (data.days.length > 0) {
    const nights = data.days.length > 1 ? data.days.length - 1 : 0;
    const durationText = `${data.days.length} Days and ${nights} Nights`;
    doc.setTextColor(...BRAND_ORANGE);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(durationText, PAGE_W / 2, y, { align: "center" });
    y += 10;
  }

  // Client info box
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, 32, 2, 2, "F");
  doc.setDrawColor(200, 210, 230);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, 32, 2, 2, "S");

  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Guest Name:", MARGIN + 5, y + 2);
  doc.setFont("helvetica", "normal");
  doc.text(data.client_name, MARGIN + 35, y + 2);

  if (data.client_contact) {
    doc.setFont("helvetica", "bold");
    doc.text("Contact:", MARGIN + 5, y + 9);
    doc.setFont("helvetica", "normal");
    doc.text(data.client_contact, MARGIN + 35, y + 9);
  }

  doc.setFont("helvetica", "bold");
  doc.text("Travel Date:", MARGIN + 5, y + 16);
  doc.setFont("helvetica", "normal");
  const dateStr = data.travel_start_date
    ? format(new Date(data.travel_start_date), "dd MMM yyyy")
    : "TBD";
  const endDateStr = data.travel_end_date
    ? ` — ${format(new Date(data.travel_end_date), "dd MMM yyyy")}`
    : "";
  doc.text(dateStr + endDateStr, MARGIN + 35, y + 16);

  doc.setFont("helvetica", "bold");
  doc.text("Total Price:", MARGIN + 5, y + 23);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREEN);
  doc.setFontSize(11);
  doc.text(`₹ ${data.total_price.toLocaleString("en-IN")}`, MARGIN + 35, y + 23);

  y += 36;

  // Description
  if (data.description) {
    y = checkPage(doc, y, 15, logoBase64);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(data.description, CONTENT_W);
    descLines.forEach((line: string) => {
      y = checkPage(doc, y, 5, logoBase64);
      doc.text(line, MARGIN, y);
      y += 4.5;
    });
    y += 4;
  }

  // Price Include (Inclusions) on first page
  if (data.inclusions.length > 0) {
    y = checkPage(doc, y, 20, logoBase64);
    y = drawSectionTitle(doc, "Price Include", y);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    data.inclusions.forEach((item) => {
      y = checkPage(doc, y, 5, logoBase64);
      doc.setTextColor(...GREEN);
      doc.text("✓", MARGIN + 3, y);
      doc.setTextColor(...DARK);
      doc.text(item, MARGIN + 9, y);
      y += 5;
    });
    y += 4;
  }

  // Price Exclude (Exclusions)
  if (data.exclusions.length > 0) {
    y = checkPage(doc, y, 20, logoBase64);
    y = drawSectionTitle(doc, "Price Exclude", y);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    data.exclusions.forEach((item) => {
      y = checkPage(doc, y, 5, logoBase64);
      doc.setTextColor(...RED);
      doc.text("✗", MARGIN + 3, y);
      doc.setTextColor(...DARK);
      doc.text(item, MARGIN + 9, y);
      y += 5;
    });
    y += 4;
  }

  // ===== ITINERARY PAGES =====
  if (data.days.length > 0) {
    doc.addPage();
    addHeader(doc, logoBase64);
    addWatermark(doc, logoBase64);
    y = HEADER_H + 5;

    data.days.forEach((day) => {
      y = checkPage(doc, y, 22, logoBase64);

      // Day header bar
      doc.setFillColor(...BRAND_ORANGE);
      doc.roundedRect(MARGIN, y - 5, CONTENT_W, 9, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}: ${day.title}`, MARGIN + 4, y + 1);
      y += 9;

      if (day.description) {
        doc.setTextColor(...DARK);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(day.description, CONTENT_W - 8);
        lines.forEach((line: string) => {
          y = checkPage(doc, y, 5, logoBase64);
          doc.text(line, MARGIN + 4, y);
          y += 4.5;
        });
      }
      y += 5;
    });
  }

  // ===== NOTE SECTION =====
  y = checkPage(doc, y, 30, logoBase64);
  y = drawSectionTitle(doc, "Note", y);
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const notes = [
    "The tour is Private Tours, means there is no other participant, just only you and your companions.",
    "Time and Tourism site is subject to change based on your request.",
    "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
  ];
  notes.forEach((note) => {
    y = checkPage(doc, y, 5, logoBase64);
    doc.text(`• ${note}`, MARGIN + 3, y, { maxWidth: CONTENT_W - 6 });
    const noteLines = doc.splitTextToSize(`• ${note}`, CONTENT_W - 6);
    y += noteLines.length * 4;
  });

  // ===== ADD FOOTERS TO ALL PAGES =====
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages);
  }

  doc.save(
    `Quotation_${data.client_name.replace(/\s+/g, "_")}_${data.destination_name.replace(/\s+/g, "_")}.pdf`
  );
}
