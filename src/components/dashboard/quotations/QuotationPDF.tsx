import jsPDF from "jspdf";
import { format } from "date-fns";

interface BriefItem {
  day: number;
  description: string;
}

interface HotelItem {
  city: string;
  hotel_name: string;
  room_type: string;
  nights: number;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  instagram: string;
}

export interface PDFSectionToggles {
  show_brief_itinerary: boolean;
  show_hotel_details: boolean;
  show_detailed_itinerary: boolean;
  show_inclusions: boolean;
  show_exclusions: boolean;
  show_pricing_table: boolean;
  show_terms_conditions: boolean;
  show_important_notes: boolean;
  show_bank_details: boolean;
  show_description: boolean;
  show_cities: boolean;
  show_watermark: boolean;
  show_closing_message: boolean;
}

export const DEFAULT_COMPANY: CompanyInfo = {
  name: "NexYatra",
  tagline: "Premium Travel Experiences",
  address: "320 Exult Shoppers, Nr. Siddhi Vinayak Temple, Vesu Main Road, Vesu, Surat, Gujarat 395007",
  email: "info@nexyatra.in",
  phone: "+91 8347015725",
  website: "www.nexyatra.in",
  instagram: "@nexyatra",
};

export const DEFAULT_SECTION_TOGGLES: PDFSectionToggles = {
  show_brief_itinerary: true,
  show_hotel_details: true,
  show_detailed_itinerary: true,
  show_inclusions: true,
  show_exclusions: true,
  show_pricing_table: true,
  show_terms_conditions: true,
  show_important_notes: true,
  show_bank_details: true,
  show_description: true,
  show_cities: true,
  show_watermark: true,
  show_closing_message: true,
};

export interface QuotationForPDF {
  client_name: string;
  client_contact?: string;
  destination_name: string;
  cities_covered?: string[];
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
  brief_itinerary?: BriefItem[];
  hotel_details?: HotelItem[];
  days: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  terms_conditions?: string[];
  important_notes?: string[];
  bank_details?: string;
  company?: CompanyInfo;
  sections?: PDFSectionToggles;
  closing_message?: string;
  custom_logo?: string | null;
}

// ─── Color Palette ───
const DEEP_NAVY: [number, number, number] = [12, 25, 55];
const NAVY: [number, number, number] = [20, 40, 80];
const GOLD: [number, number, number] = [212, 175, 85];
const GOLD_DARK: [number, number, number] = [180, 140, 60];
const GOLD_LIGHT: [number, number, number] = [245, 235, 205];
const CREAM: [number, number, number] = [252, 249, 242];
const DARK: [number, number, number] = [25, 25, 30];
const LIGHT_BG: [number, number, number] = [248, 249, 253];
const WHITE: [number, number, number] = [255, 255, 255];
const SUCCESS_GREEN: [number, number, number] = [34, 139, 80];
const DANGER_RED: [number, number, number] = [190, 45, 40];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 18;

const DEFAULT_TERMS = [
  "The tour is Private Tours, means there is no other participant, just only you and your companions.",
  "Time and Tourism site is subject to change based on your request.",
  "The price already includes applicable Government taxes and Services.",
  "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
];

function formatINR(amount: number): string {
  return "Rs. " + amount.toLocaleString("en-IN");
}

function getTotalNights(data: QuotationForPDF): number {
  const hotels = data.hotel_details?.filter(h => h.city?.trim() || h.hotel_name?.trim()) || [];
  if (hotels.length > 0) {
    const total = hotels.reduce((sum, h) => sum + (h.nights || 0), 0);
    if (total > 0) return total;
  }
  return Math.max(0, data.days.length - 1);
}

function cleanDayTitle(title: string): string {
  return title.replace(/^Day\s*\d+\s*:\s*/i, "").trim();
}

/** Pluralize helper */
function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? `${n} ${singular}` : `${n} ${plural}`;
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

function drawCheck(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.setFillColor(...SUCCESS_GREEN);
  doc.circle(cx, cy, r, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(cx - r * 0.4, cy, cx - r * 0.05, cy + r * 0.4);
  doc.line(cx - r * 0.05, cy + r * 0.4, cx + r * 0.45, cy - r * 0.35);
}

function drawCross(doc: jsPDF, cx: number, cy: number, r: number) {
  doc.setFillColor(...DANGER_RED);
  doc.circle(cx, cy, r, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.45);
  const s = r * 0.35;
  doc.line(cx - s, cy - s, cx + s, cy + s);
  doc.line(cx + s, cy - s, cx - s, cy + s);
}

// ─── Premium Cover Page ───
function drawCoverPage(
  doc: jsPDF,
  data: QuotationForPDF,
  logo: string | null,
  company: CompanyInfo,
  sections: PDFSectionToggles
) {
  // Full page navy background
  doc.setFillColor(...DEEP_NAVY);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Elegant gold border frame
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, PAGE_W - 20, PAGE_H - 20, "S");

  // Inner subtle border
  const innerGState = (doc as any).GState({ opacity: 0.3 });
  doc.saveGraphicsState();
  doc.setGState(innerGState);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, PAGE_W - 26, PAGE_H - 26, "S");
  doc.restoreGraphicsState();

  // Corner ornaments
  const cLen = 20;
  const cIn = 10;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(cIn, cIn, cIn + cLen, cIn);
  doc.line(cIn, cIn, cIn, cIn + cLen);
  doc.line(PAGE_W - cIn, cIn, PAGE_W - cIn - cLen, cIn);
  doc.line(PAGE_W - cIn, cIn, PAGE_W - cIn, cIn + cLen);
  doc.line(cIn, PAGE_H - cIn, cIn + cLen, PAGE_H - cIn);
  doc.line(cIn, PAGE_H - cIn, cIn, PAGE_H - cIn - cLen);
  doc.line(PAGE_W - cIn, PAGE_H - cIn, PAGE_W - cIn - cLen, PAGE_H - cIn);
  doc.line(PAGE_W - cIn, PAGE_H - cIn, PAGE_W - cIn, PAGE_H - cIn - cLen);

  // Logo
  let y = 55;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", PAGE_W / 2 - 22, y, 44, 44);
      y += 52;
    } catch {
      y += 10;
    }
  }

  // Company name
  y += 8;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(company.name.toUpperCase(), PAGE_W / 2, y, { align: "center" });
  y += 9;

  // Tagline
  doc.setTextColor(...GOLD);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const tagLetters = company.tagline.toUpperCase().split("").join("  ");
  doc.text(tagLetters, PAGE_W / 2, y, { align: "center" });
  y += 18;

  // Gold divider with diamond
  const divW = 80;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(PAGE_W / 2 - divW / 2, y, PAGE_W / 2 - 5, y);
  doc.line(PAGE_W / 2 + 5, y, PAGE_W / 2 + divW / 2, y);
  doc.setFillColor(...GOLD);
  doc.circle(PAGE_W / 2, y, 1.8, "F");
  y += 22;

  // Destination name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  const destLines = doc.splitTextToSize(data.destination_name.toUpperCase(), CONTENT_W + 10);
  destLines.forEach((line: string) => {
    doc.text(line, PAGE_W / 2, y, { align: "center" });
    y += 13;
  });
  y += 3;

  // "Tour Package" subtitle
  doc.setTextColor(...GOLD);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("TOUR PACKAGE", PAGE_W / 2, y, { align: "center" });
  y += 12;

  // Cities covered
  if (sections.show_cities) {
    const cities = data.cities_covered?.filter((c) => c.trim()) || [];
    if (cities.length > 0) {
      doc.setTextColor(200, 210, 230);
      doc.setFontSize(9);
      doc.text(cities.join("  •  "), PAGE_W / 2, y, { align: "center" });
      y += 12;
    }
  }

  // Duration badge with proper grammar
  if (data.days.length > 0) {
    const nights = getTotalNights(data);
    const totalPax = (data.num_persons || 0) + (data.num_children || 0);
    const dayStr = pluralize(data.days.length, "Day", "Days");
    const nightStr = pluralize(nights, "Night", "Nights");
    const durText = `${dayStr} & ${nightStr}   |   ${totalPax} Pax`;

    const badgeW = 110;
    const badgeH = 13;
    const badgeX = PAGE_W / 2 - badgeW / 2;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.roundedRect(badgeX, y - 8.5, badgeW, badgeH, 6, 6, "S");
    doc.setTextColor(...GOLD);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(durText, PAGE_W / 2, y - 0.5, { align: "center" });
    y += 20;
  }

  // ─── Guest Info Card (stacked layout to avoid overlaps) ───
  const cardX = MARGIN + 10;
  const cardW = CONTENT_W - 20;
  const cardH = 52;
  const cardY = y + 2;

  // Semi-transparent card bg
  const cardGState = (doc as any).GState({ opacity: 0.12 });
  doc.saveGraphicsState();
  doc.setGState(cardGState);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "F");
  doc.restoreGraphicsState();

  // Card border
  doc.setDrawColor(...GOLD_DARK);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "S");

  // Gold top accent
  doc.setFillColor(...GOLD);
  doc.rect(cardX + 15, cardY, cardW - 30, 1.2, "F");

  // Layout: 2 columns x 2 rows, properly spaced
  const colL = cardX + 10;
  const colR = cardX + cardW / 2 + 5;
  const valOffsetX = 38;

  // Row 1
  let ry = cardY + 14;
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("GUEST NAME", colL, ry);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.client_name, colL + valOffsetX, ry);

  if (data.client_contact) {
    doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT", colR, ry);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.client_contact, colR + valOffsetX - 5, ry);
  }

  // Separator line
  ry += 6;
  const sepGState = (doc as any).GState({ opacity: 0.2 });
  doc.saveGraphicsState();
  doc.setGState(sepGState);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.2);
  doc.line(colL, ry, cardX + cardW - 10, ry);
  doc.restoreGraphicsState();

  // Row 2
  ry += 10;
  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL DATE", colL, ry);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const startStr = data.travel_start_date
    ? format(new Date(data.travel_start_date), "dd MMM yyyy")
    : "TBD";
  const endStr = data.travel_end_date
    ? ` - ${format(new Date(data.travel_end_date), "dd MMM yyyy")}`
    : "";
  doc.text(startStr + endStr, colL + valOffsetX, ry);

  doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("NO. OF PAX", colR, ry);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const paxParts: string[] = [];
  if (data.num_persons > 0)
    paxParts.push(`${data.num_persons} ${data.person_label || "Adult"}`);
  if ((data.num_children || 0) > 0)
    paxParts.push(`${data.num_children} ${data.child_label || "Child"}`);
  doc.text(paxParts.join(" + ") || "0", colR + valOffsetX - 5, ry);

  // Cover bottom footer
  const footY = PAGE_H - 35;
  doc.setFillColor(...GOLD);
  doc.rect(0, footY, PAGE_W, 0.8, "F");

  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${company.phone}   |   ${company.email}   |   ${company.website}`,
    PAGE_W / 2,
    footY + 8,
    { align: "center" }
  );
  doc.setTextColor(150, 160, 180);
  doc.setFontSize(6);
  doc.text(company.address, PAGE_W / 2, footY + 14, { align: "center" });
}

// ─── Content Page Utilities ───
function addContentHeader(doc: jsPDF, logo: string | null, company: CompanyInfo) {
  doc.setFillColor(...DEEP_NAVY);
  doc.rect(0, 0, PAGE_W, 16, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 16, PAGE_W, 0.6, "F");

  let textX = MARGIN;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", MARGIN, 2.5, 11, 11);
      textX = MARGIN + 14;
    } catch {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, textX, 9);

  // Tagline - positioned after company name with proper spacing
  const nameWidth = doc.getTextWidth(company.name);
  doc.setTextColor(...GOLD);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  const tagX = textX + nameWidth + 5;
  // Only show tagline if it fits
  if (tagX + doc.getTextWidth(company.tagline) < PAGE_W - MARGIN) {
    doc.text(company.tagline, tagX, 9);
  }
}

function addContentFooter(doc: jsPDF, pageNum: number, totalPages: number, company: CompanyInfo) {
  const footerY = PAGE_H - FOOTER_H;
  doc.setFillColor(...GOLD);
  doc.rect(0, footerY, PAGE_W, 0.5, "F");
  doc.setFillColor(...DEEP_NAVY);
  doc.rect(0, footerY + 0.5, PAGE_W, FOOTER_H - 0.5, "F");

  const y1 = footerY + 6;
  const y2 = footerY + 11;

  doc.setTextColor(180, 185, 200);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${company.phone}  |  ${company.email}  |  ${company.website}  |  Instagram: ${company.instagram}`,
    PAGE_W / 2,
    y1,
    { align: "center" }
  );

  doc.setTextColor(120, 125, 140);
  doc.setFontSize(5);
  doc.text(company.address, PAGE_W / 2, y2, { align: "center" });

  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y1, { align: "right" });
}

function addWatermark(doc: jsPDF, logo: string | null, company: CompanyInfo) {
  const gState = (doc as any).GState({ opacity: 0.03 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  if (logo) {
    try {
      doc.addImage(logo, "PNG", PAGE_W / 2 - 30, PAGE_H / 2 - 30, 60, 60);
      doc.restoreGraphicsState();
      return;
    } catch {}
  }
  doc.setTextColor(150, 155, 170);
  doc.setFontSize(50);
  doc.setFont("helvetica", "bold");
  doc.text(company.name.toUpperCase(), PAGE_W / 2, PAGE_H / 2, {
    align: "center",
    angle: 45,
  });
  doc.restoreGraphicsState();
}

function checkPage(
  doc: jsPDF,
  y: number,
  needed: number,
  logo: string | null,
  company: CompanyInfo,
  showWatermark: boolean
): number {
  if (y + needed > PAGE_H - FOOTER_H - 8) {
    doc.addPage();
    addContentHeader(doc, logo, company);
    if (showWatermark) addWatermark(doc, logo, company);
    return 26;
  }
  return y;
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...DEEP_NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 2, 2, "F");

  // Gold left accent bar
  doc.setFillColor(...GOLD);
  doc.roundedRect(MARGIN, y, 3, 11, 1.5, 0, "F");
  doc.rect(MARGIN + 1.5, y, 1.5, 11, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN + 10, y + 7.5);

  // Right side decorative line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  const rightEnd = PAGE_W - MARGIN - 5;
  const textW = doc.getTextWidth(title.toUpperCase());
  const lineStart = MARGIN + 10 + textW + 6;
  if (lineStart < rightEnd - 10) {
    doc.line(lineStart, y + 5.5, rightEnd, y + 5.5);
  }

  return y + 16;
}

function goldDivider(doc: jsPDF, y: number): number {
  const cx = PAGE_W / 2;
  doc.setDrawColor(...GOLD_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 15, y, cx - 3, y);
  doc.line(cx + 3, y, PAGE_W - MARGIN - 15, y);
  doc.setFillColor(...GOLD);
  doc.circle(cx, y, 0.8, "F");
  return y + 5;
}

function numberedList(
  doc: jsPDF,
  items: string[],
  y: number,
  logo: string | null,
  company: CompanyInfo,
  showWatermark: boolean,
  accentColor: [number, number, number] = GOLD
): number {
  doc.setFontSize(8);
  items.forEach((note, idx) => {
    if (!note.trim()) return;
    y = checkPage(doc, y, 8, logo, company, showWatermark);

    doc.setFillColor(...accentColor);
    doc.circle(MARGIN + 5, y - 0.5, 2.8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}`, MARGIN + 5, y + 0.5, { align: "center" });

    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const nLines = doc.splitTextToSize(note, CONTENT_W - 16);
    nLines.forEach((line: string) => {
      doc.text(line, MARGIN + 12, y);
      y += 4;
    });
    y += 2.5;
  });
  return y;
}

// ─── Main Export ───
export async function generateQuotationPDF(data: QuotationForPDF) {
  const logo = data.custom_logo || (await loadLogoBase64());
  const doc = new jsPDF("p", "mm", "a4");
  const company = data.company || DEFAULT_COMPANY;
  const sections = data.sections || DEFAULT_SECTION_TOGGLES;
  const showWM = sections.show_watermark;

  // ===== COVER PAGE =====
  drawCoverPage(doc, data, logo, company, sections);

  // ===== CONTENT PAGES =====
  doc.addPage();
  addContentHeader(doc, logo, company);
  if (showWM) addWatermark(doc, logo, company);
  let y = 26;

  // Description
  if (sections.show_description && data.description) {
    y = checkPage(doc, y, 15, logo, company, showWM);
    doc.setFillColor(...CREAM);
    const descLines = doc.splitTextToSize(data.description, CONTENT_W - 16);
    const descH = descLines.length * 4.5 + 10;
    doc.roundedRect(MARGIN, y - 2, CONTENT_W, descH, 3, 3, "F");
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y - 2, 2.5, descH, "F");

    doc.setTextColor(...DARK);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    let dy = y + 5;
    descLines.forEach((line: string) => {
      doc.text(line, MARGIN + 8, dy);
      dy += 4.5;
    });
    y = dy + 4;
  }

  // Brief Itinerary
  if (sections.show_brief_itinerary) {
    const briefs = data.brief_itinerary?.filter((b) => b.description?.trim()) || [];
    if (briefs.length > 0) {
      y = checkPage(doc, y, 22, logo, company, showWM);
      y = sectionTitle(doc, "Brief Itinerary", y);

      briefs.forEach((b, idx) => {
        y = checkPage(doc, y, 8, logo, company, showWM);
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 253);
          doc.rect(MARGIN, y - 4, CONTENT_W, 8, "F");
        }
        doc.setFillColor(...NAVY);
        doc.roundedRect(MARGIN + 2, y - 3.5, 18, 6.5, 3, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(`Day ${b.day}`, MARGIN + 11, y + 0.5, { align: "center" });

        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        const briefLines = doc.splitTextToSize(b.description, CONTENT_W - 28);
        briefLines.forEach((line: string, li: number) => {
          doc.text(line, MARGIN + 24, y + li * 4);
        });
        y += Math.max(7, briefLines.length * 4 + 2);
      });
      y += 6;
    }
  }

  // Hotel Details
  if (sections.show_hotel_details) {
    const hotels = data.hotel_details?.filter((h) => h.city?.trim() || h.hotel_name?.trim()) || [];
    if (hotels.length > 0) {
      y = checkPage(doc, y, 30, logo, company, showWM);
      y = sectionTitle(doc, "Hotel Details", y);

      const tX = MARGIN;
      const tW = CONTENT_W;
      const rowH = 9;

      doc.setFillColor(...NAVY);
      doc.roundedRect(tX, y, tW, rowH, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("CITY", tX + 5, y + 6);
      doc.text("HOTEL NAME", tX + tW * 0.25, y + 6);
      doc.text("ROOM TYPE", tX + tW * 0.58, y + 6);
      doc.text("NIGHTS", tX + tW - 8, y + 6, { align: "right" });
      y += rowH;

      hotels.forEach((h, idx) => {
        y = checkPage(doc, y, rowH, logo, company, showWM);
        const bg = idx % 2 === 0 ? LIGHT_BG : WHITE;
        doc.setFillColor(...bg);
        doc.rect(tX, y, tW, rowH, "F");
        doc.setDrawColor(225, 228, 238);
        doc.setLineWidth(0.1);
        doc.line(tX, y + rowH, tX + tW, y + rowH);

        doc.setTextColor(...DARK);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(h.city || "", tX + 5, y + 6);
        doc.text(h.hotel_name || "", tX + tW * 0.25, y + 6);
        doc.text(h.room_type || "", tX + tW * 0.58, y + 6);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        doc.text(`${h.nights || 0}`, tX + tW - 8, y + 6, { align: "right" });
        y += rowH;
      });
      y += 6;
    }
  }

  // Detailed Itinerary
  if (sections.show_detailed_itinerary && data.days.length > 0) {
    y = checkPage(doc, y, 25, logo, company, showWM);

    doc.setTextColor(...NAVY);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED ITINERARY", PAGE_W / 2, y, { align: "center" });
    y += 4;
    y = goldDivider(doc, y);
    y += 2;

    data.days.forEach((day, idx) => {
      y = checkPage(doc, y, 25, logo, company, showWM);

      // Day number circle
      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 7, y + 1, 5.5, "F");
      doc.setTextColor(...DEEP_NAVY);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${day.day}`, MARGIN + 7, y + 2.5, { align: "center" });

      // Title bar
      const cleanTitle = cleanDayTitle(day.title);
      doc.setFillColor(...NAVY);
      doc.roundedRect(MARGIN + 15, y - 4, CONTENT_W - 15, 11, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      const titleText = cleanTitle ? `Day ${day.day}: ${cleanTitle}` : `Day ${day.day}`;
      const titleLines = doc.splitTextToSize(titleText, CONTENT_W - 22);
      doc.text(titleLines[0], MARGIN + 19, y + 2.5);
      y += 13;

      if (day.description) {
        const dLines = doc.splitTextToSize(day.description, CONTENT_W - 24);
        const dh = dLines.length * 4.2 + 8;
        y = checkPage(doc, y, dh, logo, company, showWM);

        doc.setFillColor(...CREAM);
        doc.roundedRect(MARGIN + 15, y - 3, CONTENT_W - 15, dh, 2, 2, "F");
        doc.setFillColor(...GOLD_LIGHT);
        doc.rect(MARGIN + 15, y - 3, 2, dh, "F");

        doc.setTextColor(...DARK);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        let descY = y + 3;
        dLines.forEach((line: string) => {
          doc.text(line, MARGIN + 21, descY);
          descY += 4.2;
        });
        y += dh + 2;
      }

      // Connector line between days
      if (idx < data.days.length - 1) {
        doc.setDrawColor(...GOLD_LIGHT);
        doc.setLineWidth(0.5);
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(MARGIN + 7, y, MARGIN + 7, y + 5);
        doc.setLineDashPattern([], 0);
        y += 7;
      } else {
        y += 4;
      }
    });
    y += 4;
  }

  // Inclusions
  if (
    sections.show_inclusions &&
    data.inclusions.length > 0 &&
    data.inclusions.some((s) => s.trim())
  ) {
    y = checkPage(doc, y, 22, logo, company, showWM);
    y = sectionTitle(doc, "Inclusions", y);

    data.inclusions.forEach((item, idx) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CONTENT_W - 16);
      const bh = lines.length * 4.2 + 2;
      y = checkPage(doc, y, bh + 2, logo, company, showWM);

      if (idx % 2 === 0) {
        doc.setFillColor(245, 252, 248);
        doc.rect(MARGIN, y - 3.5, CONTENT_W, bh + 1, "F");
      }

      drawCheck(doc, MARGIN + 5, y - 0.5, 2);

      doc.setTextColor(...DARK);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      lines.forEach((line: string) => {
        doc.text(line, MARGIN + 11, y);
        y += 4.2;
      });
      y += 1.5;
    });
    y += 5;
  }

  // Exclusions
  if (
    sections.show_exclusions &&
    data.exclusions.length > 0 &&
    data.exclusions.some((s) => s.trim())
  ) {
    y = checkPage(doc, y, 22, logo, company, showWM);
    y = sectionTitle(doc, "Exclusions", y);

    data.exclusions.forEach((item, idx) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CONTENT_W - 16);
      const bh = lines.length * 4.2 + 2;
      y = checkPage(doc, y, bh + 2, logo, company, showWM);

      if (idx % 2 === 0) {
        doc.setFillColor(252, 246, 246);
        doc.rect(MARGIN, y - 3.5, CONTENT_W, bh + 1, "F");
      }

      drawCross(doc, MARGIN + 5, y - 0.5, 2);

      doc.setTextColor(...DARK);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      lines.forEach((line: string) => {
        doc.text(line, MARGIN + 11, y);
        y += 4.2;
      });
      y += 1.5;
    });
    y += 5;
  }

  // Pricing Table
  if (sections.show_pricing_table) {
    const pricingRows: { label: string; rate: number; qty: number; amount: number }[] = [];
    if (data.price_per_person > 0 && data.num_persons > 0) {
      pricingRows.push({
        label: data.person_label || "Adult",
        rate: data.price_per_person,
        qty: data.num_persons,
        amount: data.price_per_person * data.num_persons,
      });
    }
    if ((data.price_per_child || 0) > 0 && (data.num_children || 0) > 0) {
      pricingRows.push({
        label: data.child_label || "Child",
        rate: data.price_per_child!,
        qty: data.num_children!,
        amount: data.price_per_child! * data.num_children!,
      });
    }

    if (pricingRows.length > 0) {
      y = checkPage(doc, y, 50, logo, company, showWM);
      y = sectionTitle(doc, "Total Package Amount", y);

      const tX = MARGIN;
      const tW = CONTENT_W;
      const rowH = 10;

      doc.setFillColor(...NAVY);
      doc.roundedRect(tX, y, tW, rowH, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", tX + 8, y + 6.5);
      doc.text("RATE", tX + tW * 0.4, y + 6.5);
      doc.text("QTY", tX + tW * 0.6, y + 6.5);
      doc.text("AMOUNT", tX + tW - 8, y + 6.5, { align: "right" });
      y += rowH;

      pricingRows.forEach((row, idx) => {
        const bg = idx % 2 === 0 ? LIGHT_BG : WHITE;
        doc.setFillColor(...bg);
        doc.rect(tX, y, tW, rowH, "F");
        doc.setDrawColor(230, 232, 240);
        doc.setLineWidth(0.1);
        doc.line(tX, y + rowH, tX + tW, y + rowH);

        doc.setTextColor(...DARK);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(row.label, tX + 8, y + 6.5);
        doc.text(formatINR(row.rate), tX + tW * 0.4, y + 6.5);
        doc.text(`${row.qty}`, tX + tW * 0.6, y + 6.5);
        doc.setFont("helvetica", "bold");
        doc.text(formatINR(row.amount), tX + tW - 8, y + 6.5, { align: "right" });
        y += rowH;
      });

      // Total row
      const totalRowH = 12;
      doc.setFillColor(...DEEP_NAVY);
      doc.roundedRect(tX, y, tW, totalRowH, 2, 2, "F");
      doc.setFillColor(...GOLD);
      doc.rect(tX, y, 3, totalRowH, "F");
      doc.rect(tX + tW - 3, y, 3, totalRowH, "F");

      doc.setTextColor(...GOLD);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL", tX + 10, y + 8);
      doc.text(formatINR(data.total_price), tX + tW - 10, y + 8, { align: "right" });
      y += totalRowH + 8;
    }
  }

  // Terms & Conditions
  if (sections.show_terms_conditions) {
    const terms =
      data.terms_conditions?.length && data.terms_conditions.some((t) => t.trim())
        ? data.terms_conditions.filter((t) => t.trim())
        : DEFAULT_TERMS;

    y = checkPage(doc, y, 30, logo, company, showWM);
    y = sectionTitle(doc, "Terms & Conditions", y);
    y = numberedList(doc, terms, y, logo, company, showWM, GOLD);
    y += 4;
  }

  // Important Notes
  if (sections.show_important_notes) {
    const notes = data.important_notes?.filter((n) => n.trim()) || [];
    if (notes.length > 0) {
      y = checkPage(doc, y, 20, logo, company, showWM);
      y = sectionTitle(doc, "Important Notes", y);
      y = numberedList(doc, notes, y, logo, company, showWM, NAVY);
      y += 4;
    }
  }

  // Bank Details
  if (sections.show_bank_details && data.bank_details?.trim()) {
    y = checkPage(doc, y, 35, logo, company, showWM);
    y = sectionTitle(doc, "Bank Details", y);

    const bankLines = data.bank_details.split("\n");
    const bankH = bankLines.length * 5.5 + 10;

    doc.setFillColor(...CREAM);
    doc.roundedRect(MARGIN, y - 2, CONTENT_W, bankH, 3, 3, "F");
    doc.setDrawColor(...GOLD_LIGHT);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN, y - 2, CONTENT_W, bankH, 3, 3, "S");
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y - 2, 3, bankH, "F");

    doc.setTextColor(...DARK);
    doc.setFontSize(8.5);
    let bankY = y + 5;
    bankLines.forEach((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        doc.text(parts[0].trim() + ":", MARGIN + 8, bankY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DARK);
        doc.text(parts.slice(1).join(":").trim(), MARGIN + 42, bankY);
      } else {
        doc.setFont("helvetica", "normal");
        doc.text(line, MARGIN + 8, bankY);
      }
      bankY += 5.5;
    });
    y = bankY + 6;
  }

  // Closing message
  if (sections.show_closing_message) {
    y = checkPage(doc, y, 30, logo, company, showWM);
    y += 6;
    y = goldDivider(doc, y);
    y += 5;

    const closingMsg = data.closing_message || `Thank you for choosing ${company.name}!`;
    doc.setTextColor(...NAVY);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(closingMsg, PAGE_W / 2, y, { align: "center" });
    y += 7;

    doc.setTextColor(...GOLD_DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "We look forward to creating unforgettable memories for you.",
      PAGE_W / 2,
      y,
      { align: "center" }
    );
    y += 5;

    y += 4;
    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(company.name.toUpperCase(), PAGE_W / 2, y, { align: "center" });
  }

  // ===== Add Footers to all content pages =====
  const pages = doc.getNumberOfPages();
  for (let i = 2; i <= pages; i++) {
    doc.setPage(i);
    addContentFooter(doc, i - 1, pages - 1, company);
  }

  doc.save(
    `Quotation_${data.client_name.replace(/\s+/g, "_")}_${data.destination_name.replace(/\s+/g, "_")}.pdf`
  );
}
