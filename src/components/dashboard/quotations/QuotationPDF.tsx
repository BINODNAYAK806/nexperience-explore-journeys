import jsPDF from "jspdf";
import { format } from "date-fns";

interface PricingRow {
  label: string;
  rate: number;
  qty: number;
  amount: number;
}

interface QuotationForPDF {
  client_name: string;
  client_contact?: string;
  destination_name: string;
  total_price: number;
  price_per_person: number;
  num_persons: number;
  person_label: string;
  price_per_child?: number;
  num_children?: number;
  child_label?: string;
  travel_start_date: string;
  travel_end_date?: string;
  description: string;
  days: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  terms_conditions?: string[];
}

// ─── Color Palette ───
const NAVY: [number, number, number] = [15, 32, 65];
const GOLD: [number, number, number] = [198, 160, 90];
const GOLD_LIGHT: [number, number, number] = [240, 225, 190];
const DARK: [number, number, number] = [30, 30, 35];
const GRAY: [number, number, number] = [110, 115, 125];
const LIGHT_BG: [number, number, number] = [248, 249, 252];
const WHITE: [number, number, number] = [255, 255, 255];
const SUCCESS: [number, number, number] = [34, 139, 80];
const DANGER: [number, number, number] = [180, 50, 40];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const HEADER_H = 42;
const FOOTER_H = 18;

const COMPANY = {
  name: "NexYatra",
  tagline: "Premium Travel Experiences",
  address: "320 Exult Shoppers, Nr. Siddhi Vinayak Temple, Vesu Main Road, Vesu, Surat, Gujarat 395007",
  email: "info@nexyatra.in",
  phone: "+91 8347015725",
  website: "www.nexyatra.in",
};

const DEFAULT_TERMS = [
  "The tour is Private Tours, means there is no other participant, just only you and your companions.",
  "Time and Tourism site is subject to change based on your request.",
  "The price already includes applicable Government taxes and Services.",
  "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
];

function formatINR(amount: number): string {
  return "Rs. " + amount.toLocaleString("en-IN");
}

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

// ─── Header ───
function addHeader(doc: jsPDF, logoBase64: string | null) {
  // Navy background
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 38, "F");

  // Gold accent line
  doc.setFillColor(...GOLD);
  doc.rect(0, 38, PAGE_W, 1.5, "F");

  // Subtle light line
  doc.setFillColor(...GOLD_LIGHT);
  doc.rect(0, 39.5, PAGE_W, 0.5, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN, 6, 24, 24);
    } catch { /* skip */ }
  }

  const textX = logoBase64 ? MARGIN + 28 : MARGIN;

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY.name, textX, 18);

  // Tagline
  doc.setTextColor(...GOLD);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.tagline.toUpperCase(), textX, 24);

  // Right side - contact info (well-spaced)
  const rightX = PAGE_W - MARGIN;
  doc.setTextColor(220, 225, 235);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY.phone, rightX, 12, { align: "right" });
  doc.text(COMPANY.email, rightX, 17, { align: "right" });
  doc.text(COMPANY.website, rightX, 22, { align: "right" });

  // Address - smaller, muted
  doc.setFontSize(6);
  doc.setTextColor(160, 165, 180);
  const addrLines = doc.splitTextToSize(COMPANY.address, 60);
  addrLines.forEach((line: string, i: number) => {
    doc.text(line, rightX, 28 + i * 3, { align: "right" });
  });
}

// ─── Footer ───
function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const footerY = PAGE_H - FOOTER_H;

  // Gold line
  doc.setFillColor(...GOLD);
  doc.rect(0, footerY, PAGE_W, 0.8, "F");

  // Navy bg
  doc.setFillColor(...NAVY);
  doc.rect(0, footerY + 0.8, PAGE_W, FOOTER_H - 0.8, "F");

  const textY = footerY + 9;
  doc.setTextColor(190, 195, 210);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${COMPANY.name}  |  ${COMPANY.phone}  |  ${COMPANY.email}`, PAGE_W / 2, textY, { align: "center" });

  doc.setFontSize(5.5);
  doc.setTextColor(140, 145, 160);
  doc.text(COMPANY.website, PAGE_W / 2, textY + 4, { align: "center" });

  // Page number
  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, textY, { align: "right" });
}

// ─── Watermark ───
function addWatermark(doc: jsPDF, logoBase64: string | null) {
  const gState = (doc as any).GState({ opacity: 0.04 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", PAGE_W / 2 - 35, PAGE_H / 2 - 35, 70, 70);
      doc.restoreGraphicsState();
      return;
    } catch { /* fallback */ }
  }
  doc.setTextColor(150, 155, 170);
  doc.setFontSize(55);
  doc.setFont("helvetica", "bold");
  doc.text("NEXYATRA", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

// ─── Helpers ───
function checkPage(doc: jsPDF, y: number, needed: number, logo: string | null): number {
  if (y + needed > PAGE_H - FOOTER_H - 10) {
    doc.addPage();
    addHeader(doc, logo);
    addWatermark(doc, logo);
    return HEADER_H + 10;
  }
  return y;
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "F");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, y, 3, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN + 8, y + 7);
  return y + 16;
}

function goldDivider(doc: jsPDF, y: number): number {
  doc.setDrawColor(...GOLD_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 10, y, PAGE_W - MARGIN - 10, y);
  return y + 6;
}

// ─── Main Export ───
export async function generateQuotationPDF(data: QuotationForPDF) {
  const logo = await loadLogoBase64();
  const doc = new jsPDF("p", "mm", "a4");

  // ===== PAGE 1 =====
  addHeader(doc, logo);
  addWatermark(doc, logo);

  let y = HEADER_H + 12;

  // ── Destination Title ──
  doc.setTextColor(...NAVY);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  const destTitle = data.destination_name.toUpperCase();
  doc.text(destTitle, PAGE_W / 2, y, { align: "center" });
  y += 6;

  // Ornamental lines
  doc.setFontSize(24);
  const tw = Math.min(doc.getTextWidth(destTitle) / 2 + 5, CONTENT_W / 2 - 5);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(PAGE_W / 2 - tw, y, PAGE_W / 2 - 4, y);
  doc.line(PAGE_W / 2 + 4, y, PAGE_W / 2 + tw, y);
  doc.setFillColor(...GOLD);
  doc.circle(PAGE_W / 2, y, 1.2, "F");

  y += 8;
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("TOUR PACKAGE", PAGE_W / 2, y, { align: "center" });

  // ── Duration Badge ──
  y += 12;
  if (data.days.length > 0) {
    const nights = data.days.length > 1 ? data.days.length - 1 : 0;
    const durText = `${data.days.length} Days & ${nights} Nights`;
    const bw = 70;
    doc.setFillColor(...GOLD);
    doc.roundedRect(PAGE_W / 2 - bw / 2, y - 5, bw, 11, 5.5, 5.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(durText, PAGE_W / 2, y + 2, { align: "center" });
    y += 16;
  }

  // ── Client Info Card ──
  const cardH = 44;
  // Shadow
  doc.setFillColor(225, 228, 236);
  doc.roundedRect(MARGIN + 1.5, y - 2.5, CONTENT_W, cardH, 3, 3, "F");
  // Card
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, cardH, 3, 3, "F");
  // Border
  doc.setDrawColor(215, 218, 228);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, cardH, 3, 3, "S");
  // Gold top accent
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN + 8, y - 4, CONTENT_W - 16, 1.5, "F");

  const lx = MARGIN + 8;
  const vx = MARGIN + 44;
  const rx = PAGE_W / 2 + 6;
  const rvx = PAGE_W / 2 + 40;

  // Row 1: Guest Name & Contact
  let ry = y + 6;
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("GUEST NAME", lx, ry);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.client_name, vx, ry);

  if (data.client_contact) {
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT", rx, ry);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.client_contact, rvx, ry);
  }

  // Line
  ry += 5;
  doc.setDrawColor(...GOLD_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(lx, ry, PAGE_W - MARGIN - 8, ry);

  // Row 2: Travel Date
  ry += 7;
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL DATE", lx, ry);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const startStr = data.travel_start_date ? format(new Date(data.travel_start_date), "dd MMM yyyy") : "TBD";
  const endStr = data.travel_end_date ? ` -- ${format(new Date(data.travel_end_date), "dd MMM yyyy")}` : "";
  doc.text(startStr + endStr, vx, ry);

  // Line
  ry += 5;
  doc.line(lx, ry, PAGE_W - MARGIN - 8, ry);

  // Row 3: Total Price
  ry += 7;
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PRICE", lx, ry);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(formatINR(data.total_price), vx, ry);

  // Pricing summary inline
  const priceParts: string[] = [];
  if (data.price_per_person > 0 && data.num_persons > 0) {
    priceParts.push(`${data.num_persons} ${data.person_label || "Adult"} x ${formatINR(data.price_per_person)}`);
  }
  if ((data.price_per_child || 0) > 0 && (data.num_children || 0) > 0) {
    priceParts.push(`${data.num_children} ${data.child_label || "Child"} x ${formatINR(data.price_per_child!)}`);
  }
  if (priceParts.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.text(`(${priceParts.join(" + ")})`, rx, ry);
  }

  y += cardH + 8;

  // ── Description ──
  if (data.description) {
    y = checkPage(doc, y, 15, logo);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dLines = doc.splitTextToSize(data.description, CONTENT_W - 4);
    dLines.forEach((line: string) => {
      y = checkPage(doc, y, 5, logo);
      doc.text(line, MARGIN + 2, y);
      y += 4.5;
    });
    y += 8;
  }

  // ── Inclusions ──
  if (data.inclusions.length > 0 && data.inclusions.some((s) => s.trim())) {
    y = checkPage(doc, y, 22, logo);
    y = sectionTitle(doc, "Price Includes", y);

    data.inclusions.forEach((item, idx) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CONTENT_W - 14);
      const bh = lines.length * 4.5 + 2;
      y = checkPage(doc, y, bh, logo);

      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(MARGIN, y - 3.5, CONTENT_W, bh, "F");
      }

      doc.setFillColor(...SUCCESS);
      doc.circle(MARGIN + 5, y - 0.5, 1.2, "F");

      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      lines.forEach((line: string) => {
        doc.text(line, MARGIN + 10, y);
        y += 4.5;
      });
      y += 1;
    });
    y += 8;
  }

  // ── Exclusions ──
  if (data.exclusions.length > 0 && data.exclusions.some((s) => s.trim())) {
    y = checkPage(doc, y, 22, logo);
    y = sectionTitle(doc, "Price Excludes", y);

    data.exclusions.forEach((item, idx) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CONTENT_W - 14);
      const bh = lines.length * 4.5 + 2;
      y = checkPage(doc, y, bh, logo);

      if (idx % 2 === 0) {
        doc.setFillColor(252, 248, 248);
        doc.rect(MARGIN, y - 3.5, CONTENT_W, bh, "F");
      }

      doc.setFillColor(...DANGER);
      doc.circle(MARGIN + 5, y - 0.5, 1.2, "F");

      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      lines.forEach((line: string) => {
        doc.text(line, MARGIN + 10, y);
        y += 4.5;
      });
      y += 1;
    });
    y += 8;
  }

  // ===== ITINERARY =====
  if (data.days.length > 0) {
    doc.addPage();
    addHeader(doc, logo);
    addWatermark(doc, logo);
    y = HEADER_H + 10;

    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED ITINERARY", PAGE_W / 2, y, { align: "center" });
    y += 4;
    y = goldDivider(doc, y);
    y += 4;

    data.days.forEach((day, idx) => {
      y = checkPage(doc, y, 28, logo);

      // Day badge
      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 6, y, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${day.day}`, MARGIN + 6, y + 1.5, { align: "center" });

      // Day title bar
      doc.setFillColor(...NAVY);
      doc.roundedRect(MARGIN + 14, y - 5, CONTENT_W - 14, 10, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Day ${day.day}: ${day.title}`, MARGIN + 18, y + 1.5);
      y += 12;

      if (day.description) {
        const dLines = doc.splitTextToSize(day.description, CONTENT_W - 22);
        const dh = dLines.length * 4.5 + 6;
        y = checkPage(doc, y, dh, logo);

        doc.setFillColor(...LIGHT_BG);
        doc.roundedRect(MARGIN + 14, y - 3, CONTENT_W - 14, dh, 1.5, 1.5, "F");
        doc.setFillColor(...GOLD_LIGHT);
        doc.rect(MARGIN + 14, y - 3, 1.5, dh, "F");

        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        dLines.forEach((line: string) => {
          y = checkPage(doc, y, 5, logo);
          doc.text(line, MARGIN + 19, y + 1);
          y += 4.5;
        });
        y += 4;
      }

      // Connector line
      if (idx < data.days.length - 1) {
        doc.setDrawColor(...GOLD_LIGHT);
        doc.setLineWidth(0.4);
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(MARGIN + 6, y, MARGIN + 6, y + 6);
        doc.setLineDashPattern([], 0);
        y += 8;
      } else {
        y += 6;
      }
    });
  }

  // ===== PRICING BREAKDOWN =====
  const pricingRows: PricingRow[] = [];
  if (data.price_per_person > 0 && data.num_persons > 0) {
    pricingRows.push({
      label: `${data.person_label || "Adult"}`,
      rate: data.price_per_person,
      qty: data.num_persons,
      amount: data.price_per_person * data.num_persons,
    });
  }
  if ((data.price_per_child || 0) > 0 && (data.num_children || 0) > 0) {
    pricingRows.push({
      label: `${data.child_label || "Child"}`,
      rate: data.price_per_child!,
      qty: data.num_children!,
      amount: data.price_per_child! * data.num_children!,
    });
  }

  if (pricingRows.length > 0) {
    y = checkPage(doc, y, 45, logo);
    y += 4;
    y = sectionTitle(doc, "Pricing Breakdown", y);

    const tX = MARGIN;
    const tW = CONTENT_W;
    const rowH = 9;

    // Table header
    doc.setFillColor(...NAVY);
    doc.roundedRect(tX, y, tW, rowH, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", tX + 6, y + 6);
    doc.text("RATE", tX + tW * 0.45, y + 6);
    doc.text("QTY", tX + tW * 0.65, y + 6);
    doc.text("AMOUNT", tX + tW - 6, y + 6, { align: "right" });
    y += rowH;

    // Data rows
    pricingRows.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? LIGHT_BG : WHITE;
      doc.setFillColor(...bg);
      doc.rect(tX, y, tW, rowH, "F");
      doc.setDrawColor(220, 225, 235);
      doc.setLineWidth(0.15);
      doc.rect(tX, y, tW, rowH, "S");

      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(row.label, tX + 6, y + 6);
      doc.text(formatINR(row.rate), tX + tW * 0.45, y + 6);
      doc.text(`${row.qty}`, tX + tW * 0.65, y + 6);
      doc.setFont("helvetica", "bold");
      doc.text(formatINR(row.amount), tX + tW - 6, y + 6, { align: "right" });
      y += rowH;
    });

    // Total row
    doc.setFillColor(...NAVY);
    doc.roundedRect(tX, y, tW, rowH + 1, 1.5, 1.5, "F");
    doc.setTextColor(...GOLD);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", tX + 6, y + 6.5);
    doc.text(formatINR(data.total_price), tX + tW - 6, y + 6.5, { align: "right" });
    y += rowH + 10;
  }

  // ===== TERMS & CONDITIONS =====
  const terms = data.terms_conditions && data.terms_conditions.length > 0 && data.terms_conditions.some((t) => t.trim())
    ? data.terms_conditions.filter((t) => t.trim())
    : DEFAULT_TERMS;

  y = checkPage(doc, y, 40, logo);
  y += 4;
  y = sectionTitle(doc, "Terms & Conditions", y);

  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  terms.forEach((note, idx) => {
    y = checkPage(doc, y, 8, logo);
    // Gold number badge
    doc.setFillColor(...GOLD);
    doc.circle(MARGIN + 4, y - 0.5, 2.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}`, MARGIN + 4, y + 0.5, { align: "center" });

    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const nLines = doc.splitTextToSize(note, CONTENT_W - 14);
    nLines.forEach((line: string) => {
      doc.text(line, MARGIN + 10, y);
      y += 3.8;
    });
    y += 3;
  });

  // ===== Thank You =====
  y = checkPage(doc, y, 20, logo);
  y += 8;
  doc.setTextColor(...NAVY);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for choosing NexYatra!", PAGE_W / 2, y, { align: "center" });
  y += 6;
  doc.setTextColor(...GOLD);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("We look forward to creating unforgettable memories for you.", PAGE_W / 2, y, { align: "center" });

  // ===== Footers ===== 
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages);
  }

  doc.save(`Quotation_${data.client_name.replace(/\s+/g, "_")}_${data.destination_name.replace(/\s+/g, "_")}.pdf`);
}
