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

export type PDFColorTheme = "navy_gold" | "modern_blue" | "elegant_green" | "classic_red" | "royal_purple" | "custom";
export type PDFFontScale = "small" | "normal" | "large" | "extra_large";

export interface PDFStyleConfig {
  colorTheme: PDFColorTheme;
  fontScale: PDFFontScale;
  properCase: boolean; // capitalize words properly
  customPrimaryColor?: [number, number, number];
  customAccentColor?: [number, number, number];
}

export const DEFAULT_STYLE_CONFIG: PDFStyleConfig = {
  colorTheme: "navy_gold",
  fontScale: "normal",
  properCase: false,
};

export const COLOR_THEMES: Record<string, { primary: [number, number, number]; primaryDark: [number, number, number]; accent: [number, number, number]; accentLight: [number, number, number]; label: string }> = {
  navy_gold: { primary: [26, 42, 74], primaryDark: [15, 25, 50], accent: [193, 160, 80], accentLight: [230, 215, 170], label: "Navy & Gold" },
  modern_blue: { primary: [37, 99, 235], primaryDark: [29, 78, 216], accent: [14, 165, 233], accentLight: [186, 230, 253], label: "Modern Blue" },
  elegant_green: { primary: [22, 101, 52], primaryDark: [20, 83, 45], accent: [34, 197, 94], accentLight: [187, 247, 208], label: "Elegant Green" },
  classic_red: { primary: [153, 27, 27], primaryDark: [127, 29, 29], accent: [220, 38, 38], accentLight: [254, 202, 202], label: "Classic Red" },
  royal_purple: { primary: [88, 28, 135], primaryDark: [59, 7, 100], accent: [168, 85, 247], accentLight: [233, 213, 255], label: "Royal Purple" },
};

const FONT_SCALES: Record<PDFFontScale, number> = {
  small: 0.85,
  normal: 1,
  large: 1.15,
  extra_large: 1.3,
};

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
  style?: PDFStyleConfig;
}

// ─── Mutable Colors (set per PDF generation) ───
let C = {
  navy: [26, 42, 74] as [number, number, number],
  navyDark: [15, 25, 50] as [number, number, number],
  gold: [193, 160, 80] as [number, number, number],
  goldLight: [230, 215, 170] as [number, number, number],
  text: [33, 37, 41] as [number, number, number],
  textLight: [100, 110, 125] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  bg: [250, 250, 252] as [number, number, number],
  bgAlt: [244, 245, 250] as [number, number, number],
  green: [39, 135, 75] as [number, number, number],
  red: [185, 50, 50] as [number, number, number],
  border: [215, 220, 230] as [number, number, number],
};

let fontScaleMultiplier = 1;
let useProperCase = false;

function applyStyle(style?: PDFStyleConfig) {
  const s = style || DEFAULT_STYLE_CONFIG;
  // Resolve color theme
  if (s.colorTheme === "custom") {
    C.navy = s.customPrimaryColor || [26, 42, 74];
    C.navyDark = s.customPrimaryColor || [15, 25, 50];
    C.gold = s.customAccentColor || [193, 160, 80];
    C.goldLight = s.customAccentColor ? lightenColor(s.customAccentColor) : [230, 215, 170];
  } else {
    const theme = COLOR_THEMES[s.colorTheme] || COLOR_THEMES.navy_gold;
    C.navy = theme.primary;
    C.navyDark = theme.primaryDark;
    C.gold = theme.accent;
    C.goldLight = theme.accentLight;
  }
  fontScaleMultiplier = FONT_SCALES[s.fontScale || "normal"];
  useProperCase = s.properCase || false;
}

function lightenColor(c: [number, number, number]): [number, number, number] {
  return [Math.min(255, c[0] + 100), Math.min(255, c[1] + 100), Math.min(255, c[2] + 100)];
}

function sz(base: number): number {
  return Math.round(base * fontScaleMultiplier * 10) / 10;
}

function pc(text: string): string {
  if (!useProperCase) return text;
  return text.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const PW = 210;
const PH = 297;
const M = 18;
const CW = PW - M * 2;
const FOOTER_H = 14;

const DEFAULT_TERMS = [
  "The tour is Private Tours, means there is no other participant, just only you and your companions.",
  "Time and Tourism site is subject to change based on your request.",
  "The price already includes applicable Government taxes and Services.",
  "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
];

function inr(n: number): string {
  return "Rs. " + n.toLocaleString("en-IN");
}

function nights(data: QuotationForPDF): number {
  const h = data.hotel_details?.filter(h => h.city?.trim() || h.hotel_name?.trim()) || [];
  if (h.length > 0) {
    const t = h.reduce((s, x) => s + (x.nights || 0), 0);
    if (t > 0) return t;
  }
  return Math.max(0, data.days.length - 1);
}

function cleanTitle(t: string): string {
  return t.replace(/^Day\s*\d+\s*:\s*/i, "").trim();
}

function pl(n: number, s: string, p: string): string {
  return n === 1 ? `${n} ${s}` : `${n} ${p}`;
}

async function loadLogo(): Promise<string | null> {
  try {
    const r = await fetch("/lovable-uploads/2b127b7a-f8e2-4ed9-b75a-f14f4e215484.png");
    const b = await r.blob();
    return new Promise(res => {
      const rd = new FileReader();
      rd.onloadend = () => res(rd.result as string);
      rd.onerror = () => res(null);
      rd.readAsDataURL(b);
    });
  } catch { return null; }
}

// ─── Shared Helpers ───
function ensurePage(doc: jsPDF, y: number, need: number, logo: string | null, co: CompanyInfo, wm: boolean): number {
  if (y + need > PH - FOOTER_H - 6) {
    doc.addPage();
    drawHeader(doc, logo, co);
    if (wm) drawWatermark(doc, logo, co);
    return 24;
  }
  return y;
}

function drawHeader(doc: jsPDF, logo: string | null, co: CompanyInfo) {
  // Simple thin navy bar
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, PW, 14, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, 14, PW, 0.5, "F");

  let tx = M;
  if (logo) {
    try { doc.addImage(logo, "PNG", M, 1.5, 11, 11); tx = M + 14; } catch {}
  }
  doc.setTextColor(...C.white);
  doc.setFontSize(sz(10));
  doc.setFont("helvetica", "bold");
  doc.text(co.name, tx, 8.5);

  const nw = doc.getTextWidth(co.name);
  const tagX = tx + nw + 4;
  doc.setTextColor(...C.goldLight);
  doc.setFontSize(sz(6));
  doc.setFont("helvetica", "normal");
  if (tagX + doc.getTextWidth(co.tagline) < PW - M) {
    doc.text(co.tagline, tagX, 8.5);
  }
}

function drawFooter(doc: jsPDF, pg: number, total: number, co: CompanyInfo) {
  const fy = PH - FOOTER_H;
  doc.setFillColor(...C.navy);
  doc.rect(0, fy, PW, FOOTER_H, "F");
  doc.setFillColor(...C.gold);
  doc.rect(0, fy, PW, 0.4, "F");

  doc.setTextColor(180, 185, 200);
  doc.setFontSize(sz(5.5));
  doc.setFont("helvetica", "normal");
  doc.text(`${co.phone}  |  ${co.email}  |  ${co.website}  |  ${co.instagram}`, PW / 2, fy + 5.5, { align: "center" });

  doc.setTextColor(130, 135, 150);
  doc.setFontSize(sz(4.5));
  doc.text(co.address, PW / 2, fy + 9.5, { align: "center" });

  doc.setTextColor(...C.gold);
  doc.setFontSize(sz(6));
  doc.setFont("helvetica", "bold");
  doc.text(`${pg} / ${total}`, PW - M, fy + 5.5, { align: "right" });
}

function drawWatermark(doc: jsPDF, logo: string | null, co: CompanyInfo) {
  const gs = (doc as any).GState({ opacity: 0.03 });
  doc.saveGraphicsState();
  doc.setGState(gs);
  if (logo) {
    try { doc.addImage(logo, "PNG", PW / 2 - 28, PH / 2 - 28, 56, 56); doc.restoreGraphicsState(); return; } catch {}
  }
  doc.setTextColor(150, 155, 170);
  doc.setFontSize(sz(48));
  doc.setFont("helvetica", "bold");
  doc.text(co.name.toUpperCase(), PW / 2, PH / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

function sectionHeading(doc: jsPDF, title: string, y: number): number {
  // Simple: gold left bar + navy text
  doc.setFillColor(...C.gold);
  doc.rect(M, y, 3, 8, "F");
  doc.setTextColor(...C.navy);
  doc.setFontSize(sz(11));
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), M + 7, y + 6);

  // Subtle line
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.2);
  doc.line(M, y + 10, M + CW, y + 10);
  return y + 15;
}

function drawCheck(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...C.green);
  doc.circle(x, y, 1.8, "F");
  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.4);
  doc.line(x - 0.7, y, x - 0.1, y + 0.7);
  doc.line(x - 0.1, y + 0.7, x + 0.8, y - 0.5);
}

function drawCross(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(...C.red);
  doc.circle(x, y, 1.8, "F");
  doc.setDrawColor(...C.white);
  doc.setLineWidth(0.4);
  const s = 0.6;
  doc.line(x - s, y - s, x + s, y + s);
  doc.line(x + s, y - s, x - s, y + s);
}

// ─── Cover Page ───
function drawCover(doc: jsPDF, data: QuotationForPDF, logo: string | null, co: CompanyInfo, sec: PDFSectionToggles) {
  // Full navy background
  doc.setFillColor(...C.navyDark);
  doc.rect(0, 0, PW, PH, "F");

  // Simple thin gold border
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.6);
  doc.rect(12, 12, PW - 24, PH - 24, "S");

  // Logo
  let y = 50;
  if (logo) {
    try { doc.addImage(logo, "PNG", PW / 2 - 20, y, 40, 40); y += 48; } catch { y += 5; }
  }

  // Company name
  y += 5;
  doc.setTextColor(...C.white);
  doc.setFontSize(sz(26));
  doc.setFont("helvetica", "bold");
  doc.text(co.name.toUpperCase(), PW / 2, y, { align: "center" });
  y += 8;

  // Tagline
  doc.setTextColor(...C.gold);
  doc.setFontSize(sz(9));
  doc.setFont("helvetica", "normal");
  doc.text(co.tagline.toUpperCase(), PW / 2, y, { align: "center" });
  y += 20;

  // Simple gold line
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.5);
  doc.line(PW / 2 - 30, y, PW / 2 + 30, y);
  y += 18;

  // Destination
  doc.setTextColor(...C.white);
  doc.setFontSize(sz(28));
  doc.setFont("helvetica", "bold");
  const destLines = doc.splitTextToSize(pc(data.destination_name.toUpperCase()), CW);
  destLines.forEach((line: string) => {
    doc.text(line, PW / 2, y, { align: "center" });
    y += 12;
  });
  y += 2;

  // Tour Package label
  doc.setTextColor(...C.gold);
  doc.setFontSize(sz(10));
  doc.setFont("helvetica", "normal");
  doc.text("TOUR PACKAGE", PW / 2, y, { align: "center" });
  y += 10;

  // Cities
  if (sec.show_cities) {
    const cities = data.cities_covered?.filter(c => c.trim()) || [];
    if (cities.length > 0) {
      doc.setTextColor(180, 190, 210);
      doc.setFontSize(sz(8));
      doc.text(cities.map(c => pc(c)).join("  \u2022  "), PW / 2, y, { align: "center" });
      y += 10;
    }
  }

  // Duration badge
  if (data.days.length > 0) {
    const n = nights(data);
    const pax = (data.num_persons || 0) + (data.num_children || 0);
    const txt = `${pl(data.days.length, "Day", "Days")} & ${pl(n, "Night", "Nights")}  |  ${pax} Pax`;
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.4);
    const bw = 100;
    doc.roundedRect(PW / 2 - bw / 2, y - 5, bw, 12, 6, 6, "S");
    doc.setTextColor(...C.gold);
    doc.setFontSize(sz(9));
    doc.setFont("helvetica", "bold");
    doc.text(txt, PW / 2, y + 2, { align: "center" });
    y += 22;
  }

  // Guest info - simple layout
  const cardW = CW - 20;
  const cardX = M + 10;
  const cardH = 40;

  // Semi-transparent card
  const cg = (doc as any).GState({ opacity: 0.08 });
  doc.saveGraphicsState();
  doc.setGState(cg);
  doc.setFillColor(...C.white);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, "F");
  doc.restoreGraphicsState();

  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, "S");

  // Row 1: Guest | Contact
  const col1 = cardX + 8;
  const col2 = cardX + cardW / 2 + 4;
  let ry = y + 12;

  doc.setFontSize(sz(6));
  doc.setTextColor(...C.gold);
  doc.setFont("helvetica", "bold");
  doc.text("GUEST", col1, ry);
  doc.setFontSize(sz(9));
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "normal");
  doc.text(pc(data.client_name), col1, ry + 5);

  if (data.client_contact) {
    doc.setFontSize(sz(6));
    doc.setTextColor(...C.gold);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT", col2, ry);
    doc.setFontSize(sz(9));
    doc.setTextColor(...C.white);
    doc.setFont("helvetica", "normal");
    doc.text(data.client_contact, col2, ry + 5);
  }

  // Row 2: Travel Date | Pax
  ry += 16;
  doc.setFontSize(sz(6));
  doc.setTextColor(...C.gold);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL DATE", col1, ry);
  const sd = data.travel_start_date ? format(new Date(data.travel_start_date), "dd MMM yyyy") : "TBD";
  const ed = data.travel_end_date ? ` - ${format(new Date(data.travel_end_date), "dd MMM yyyy")}` : "";
  doc.setFontSize(sz(9));
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "normal");
  doc.text(sd + ed, col1, ry + 5);

  doc.setFontSize(sz(6));
  doc.setTextColor(...C.gold);
  doc.setFont("helvetica", "bold");
  doc.text("PAX", col2, ry);
  const pp: string[] = [];
  if (data.num_persons > 0) pp.push(`${data.num_persons} ${data.person_label || "Adult"}`);
  if ((data.num_children || 0) > 0) pp.push(`${data.num_children} ${data.child_label || "Child"}`);
  doc.setFontSize(sz(9));
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "normal");
  doc.text(pp.join(" + ") || "0", col2, ry + 5);

  // Bottom contact strip
  const by = PH - 30;
  doc.setTextColor(...C.gold);
  doc.setFontSize(sz(7));
  doc.setFont("helvetica", "normal");
  doc.text(`${co.phone}  |  ${co.email}  |  ${co.website}`, PW / 2, by, { align: "center" });
  doc.setTextColor(130, 140, 160);
  doc.setFontSize(sz(5.5));
  doc.text(co.address, PW / 2, by + 6, { align: "center" });
}

// ─── Main Export ───
export async function generateQuotationPDF(data: QuotationForPDF) {
  // Apply style customization
  applyStyle(data.style);

  const logo = data.custom_logo || (await loadLogo());
  const doc = new jsPDF("p", "mm", "a4");
  const co = data.company || DEFAULT_COMPANY;
  const sec = data.sections || DEFAULT_SECTION_TOGGLES;
  const wm = sec.show_watermark;

  // ===== COVER =====
  drawCover(doc, data, logo, co, sec);

  // ===== CONTENT =====
  doc.addPage();
  doc.setFillColor(...C.bg);
  doc.rect(0, 0, PW, PH, "F");
  drawHeader(doc, logo, co);
  if (wm) drawWatermark(doc, logo, co);
  let y = 22;

  // Description
  if (sec.show_description && data.description) {
    y = ensurePage(doc, y, 15, logo, co, wm);
    const dl = doc.splitTextToSize(data.description, CW - 14);
    const dh = dl.length * 4.5 + 8;
    doc.setFillColor(...C.white);
    doc.roundedRect(M, y, CW, dh, 2, 2, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.15);
    doc.roundedRect(M, y, CW, dh, 2, 2, "S");
    doc.setFillColor(...C.gold);
    doc.rect(M, y, 2.5, dh, "F");

    doc.setTextColor(...C.text);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    let dy = y + 5;
    dl.forEach((l: string) => { doc.text(l, M + 8, dy); dy += 4.5; });
    y = dy + 4;
  }

  // Brief Itinerary
  if (sec.show_brief_itinerary) {
    const briefs = data.brief_itinerary?.filter(b => b.description?.trim()) || [];
    if (briefs.length > 0) {
      y = ensurePage(doc, y, 20, logo, co, wm);
      y = sectionHeading(doc, "Brief Itinerary", y);

      briefs.forEach((b, i) => {
        y = ensurePage(doc, y, 8, logo, co, wm);
        if (i % 2 === 0) {
          doc.setFillColor(...C.bgAlt);
          doc.rect(M, y - 3.5, CW, 8, "F");
        }
        // Day pill
        doc.setFillColor(...C.navy);
        doc.roundedRect(M + 2, y - 3, 16, 6, 3, 3, "F");
        doc.setTextColor(...C.white);
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.text(`Day ${b.day}`, M + 10, y + 0.5, { align: "center" });

        doc.setTextColor(...C.text);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const bl = doc.splitTextToSize(b.description, CW - 26);
        bl.forEach((l: string, li: number) => { doc.text(l, M + 22, y + li * 4); });
        y += Math.max(7, bl.length * 4 + 2);
      });
      y += 6;
    }
  }

  // Hotel Details
  if (sec.show_hotel_details) {
    const hotels = data.hotel_details?.filter(h => h.city?.trim() || h.hotel_name?.trim()) || [];
    if (hotels.length > 0) {
      y = ensurePage(doc, y, 28, logo, co, wm);
      y = sectionHeading(doc, "Hotel Details", y);

      const rH = 8;
      // Header row
      doc.setFillColor(...C.navy);
      doc.rect(M, y, CW, rH, "F");
      doc.setTextColor(...C.white);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text("CITY", M + 4, y + 5.5);
      doc.text("HOTEL", M + CW * 0.25, y + 5.5);
      doc.text("ROOM TYPE", M + CW * 0.55, y + 5.5);
      doc.text("NIGHTS", M + CW - 5, y + 5.5, { align: "right" });
      y += rH;

      hotels.forEach((h, i) => {
        y = ensurePage(doc, y, rH, logo, co, wm);
        const bg1 = i % 2 === 0 ? C.white : C.bgAlt;
        doc.setFillColor(...bg1);
        doc.rect(M, y, CW, rH, "F");
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.1);
        doc.line(M, y + rH, M + CW, y + rH);

        doc.setTextColor(...C.text);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(h.city || "", M + 4, y + 5.5);
        doc.text(h.hotel_name || "", M + CW * 0.25, y + 5.5);
        doc.text(h.room_type || "", M + CW * 0.55, y + 5.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.navy);
        doc.text(`${h.nights || 0}`, M + CW - 5, y + 5.5, { align: "right" });
        y += rH;
      });
      y += 6;
    }
  }

  // Detailed Itinerary
  if (sec.show_detailed_itinerary && data.days.length > 0) {
    y = ensurePage(doc, y, 20, logo, co, wm);
    y = sectionHeading(doc, "Detailed Itinerary", y);

    data.days.forEach((day, idx) => {
      y = ensurePage(doc, y, 22, logo, co, wm);

      // Day number badge
      doc.setFillColor(...C.gold);
      doc.roundedRect(M, y - 3, 22, 9, 2, 2, "F");
      doc.setTextColor(...C.navyDark);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`DAY ${day.day}`, M + 11, y + 2.5, { align: "center" });

      // Title
      const ct = cleanTitle(day.title);
      if (ct) {
        doc.setTextColor(...C.navy);
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.text(ct, M + 26, y + 2.5);
      }
      y += 10;

      // Description
      if (day.description) {
        const dl = doc.splitTextToSize(day.description, CW - 10);
        const dh = dl.length * 4 + 6;
        y = ensurePage(doc, y, dh, logo, co, wm);

        doc.setFillColor(...C.white);
        doc.roundedRect(M + 2, y - 2, CW - 4, dh, 2, 2, "F");
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.1);
        doc.roundedRect(M + 2, y - 2, CW - 4, dh, 2, 2, "S");

        doc.setTextColor(...C.text);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        let ty = y + 3;
        dl.forEach((l: string) => { doc.text(l, M + 6, ty); ty += 4; });
        y += dh + 2;
      }

      // Separator dot between days
      if (idx < data.days.length - 1) {
        doc.setFillColor(...C.goldLight);
        doc.circle(M + 11, y + 2, 0.8, "F");
        y += 6;
      } else {
        y += 3;
      }
    });
    y += 4;
  }

  // Inclusions
  if (sec.show_inclusions && data.inclusions.some(s => s.trim())) {
    y = ensurePage(doc, y, 20, logo, co, wm);
    y = sectionHeading(doc, "Inclusions", y);

    data.inclusions.forEach((item, i) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CW - 14);
      y = ensurePage(doc, y, lines.length * 4 + 3, logo, co, wm);

      if (i % 2 === 0) {
        doc.setFillColor(246, 252, 248);
        doc.rect(M, y - 3, CW, lines.length * 4 + 2, "F");
      }
      drawCheck(doc, M + 4, y - 0.5);
      doc.setTextColor(...C.text);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      lines.forEach((l: string) => { doc.text(l, M + 10, y); y += 4; });
      y += 1.5;
    });
    y += 5;
  }

  // Exclusions
  if (sec.show_exclusions && data.exclusions.some(s => s.trim())) {
    y = ensurePage(doc, y, 20, logo, co, wm);
    y = sectionHeading(doc, "Exclusions", y);

    data.exclusions.forEach((item, i) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CW - 14);
      y = ensurePage(doc, y, lines.length * 4 + 3, logo, co, wm);

      if (i % 2 === 0) {
        doc.setFillColor(252, 246, 246);
        doc.rect(M, y - 3, CW, lines.length * 4 + 2, "F");
      }
      drawCross(doc, M + 4, y - 0.5);
      doc.setTextColor(...C.text);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      lines.forEach((l: string) => { doc.text(l, M + 10, y); y += 4; });
      y += 1.5;
    });
    y += 5;
  }

  // Pricing Table
  if (sec.show_pricing_table) {
    const rows: { label: string; rate: number; qty: number; amount: number }[] = [];
    if (data.price_per_person > 0 && data.num_persons > 0) {
      rows.push({ label: data.person_label || "Adult", rate: data.price_per_person, qty: data.num_persons, amount: data.price_per_person * data.num_persons });
    }
    if ((data.price_per_child || 0) > 0 && (data.num_children || 0) > 0) {
      rows.push({ label: data.child_label || "Child", rate: data.price_per_child!, qty: data.num_children!, amount: data.price_per_child! * data.num_children! });
    }

    if (rows.length > 0) {
      y = ensurePage(doc, y, 45, logo, co, wm);
      y = sectionHeading(doc, "Package Amount", y);

      const rH = 9;
      // Header
      doc.setFillColor(...C.navy);
      doc.rect(M, y, CW, rH, "F");
      doc.setTextColor(...C.white);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", M + 6, y + 6);
      doc.text("RATE", M + CW * 0.4, y + 6);
      doc.text("QTY", M + CW * 0.6, y + 6);
      doc.text("AMOUNT", M + CW - 6, y + 6, { align: "right" });
      y += rH;

      rows.forEach((r, i) => {
        const bg2 = i % 2 === 0 ? C.white : C.bgAlt;
        doc.setFillColor(...bg2);
        doc.rect(M, y, CW, rH, "F");
        doc.setDrawColor(...C.border);
        doc.setLineWidth(0.1);
        doc.line(M, y + rH, M + CW, y + rH);
        doc.setTextColor(...C.text);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(r.label, M + 6, y + 6);
        doc.text(inr(r.rate), M + CW * 0.4, y + 6);
        doc.text(`${r.qty}`, M + CW * 0.6, y + 6);
        doc.setFont("helvetica", "bold");
        doc.text(inr(r.amount), M + CW - 6, y + 6, { align: "right" });
        y += rH;
      });

      // Total
      const tH = 11;
      doc.setFillColor(...C.navyDark);
      doc.rect(M, y, CW, tH, "F");
      doc.setTextColor(...C.gold);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL", M + 6, y + 7.5);
      doc.text(inr(data.total_price), M + CW - 6, y + 7.5, { align: "right" });
      y += tH + 8;
    }
  }

  // Terms & Conditions
  if (sec.show_terms_conditions) {
    const terms = data.terms_conditions?.length && data.terms_conditions.some(t => t.trim())
      ? data.terms_conditions.filter(t => t.trim())
      : DEFAULT_TERMS;

    y = ensurePage(doc, y, 25, logo, co, wm);
    y = sectionHeading(doc, "Terms & Conditions", y);

    terms.forEach((t, i) => {
      if (!t.trim()) return;
      const lines = doc.splitTextToSize(t, CW - 14);
      y = ensurePage(doc, y, lines.length * 4 + 4, logo, co, wm);

      // Number circle
      doc.setFillColor(...C.gold);
      doc.circle(M + 4, y - 0.5, 2.5, "F");
      doc.setTextColor(...C.white);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, M + 4, y + 0.5, { align: "center" });

      doc.setTextColor(...C.text);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      lines.forEach((l: string) => { doc.text(l, M + 10, y); y += 4; });
      y += 2.5;
    });
    y += 4;
  }

  // Important Notes
  if (sec.show_important_notes) {
    const notes = data.important_notes?.filter(n => n.trim()) || [];
    if (notes.length > 0) {
      y = ensurePage(doc, y, 20, logo, co, wm);
      y = sectionHeading(doc, "Important Notes", y);

      notes.forEach((n, i) => {
        if (!n.trim()) return;
        const lines = doc.splitTextToSize(n, CW - 14);
        y = ensurePage(doc, y, lines.length * 4 + 4, logo, co, wm);

        doc.setFillColor(...C.navy);
        doc.circle(M + 4, y - 0.5, 2.5, "F");
        doc.setTextColor(...C.white);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}`, M + 4, y + 0.5, { align: "center" });

        doc.setTextColor(...C.text);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        lines.forEach((l: string) => { doc.text(l, M + 10, y); y += 4; });
        y += 2.5;
      });
      y += 4;
    }
  }

  // Bank Details
  if (sec.show_bank_details && data.bank_details?.trim()) {
    y = ensurePage(doc, y, 30, logo, co, wm);
    y = sectionHeading(doc, "Bank Details", y);

    const blines = data.bank_details.split("\n");
    const bh = blines.length * 5 + 8;

    doc.setFillColor(...C.white);
    doc.roundedRect(M, y, CW, bh, 2, 2, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.15);
    doc.roundedRect(M, y, CW, bh, 2, 2, "S");
    doc.setFillColor(...C.gold);
    doc.rect(M, y, 2.5, bh, "F");

    let by = y + 5;
    doc.setFontSize(8);
    blines.forEach(line => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...C.navy);
        doc.text(parts[0].trim() + ":", M + 7, by);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.text);
        doc.text(parts.slice(1).join(":").trim(), M + 40, by);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.text);
        doc.text(line, M + 7, by);
      }
      by += 5;
    });
    y = by + 5;
  }

  // Closing
  if (sec.show_closing_message) {
    y = ensurePage(doc, y, 30, logo, co, wm);
    y += 8;

    // Simple line
    doc.setDrawColor(...C.goldLight);
    doc.setLineWidth(0.3);
    doc.line(PW / 2 - 25, y, PW / 2 + 25, y);
    y += 8;

    const msg = data.closing_message || `Thank you for choosing ${co.name}!`;
    doc.setTextColor(...C.navy);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(msg, PW / 2, y, { align: "center" });
    y += 7;

    doc.setTextColor(...C.textLight);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("We look forward to creating unforgettable memories for you.", PW / 2, y, { align: "center" });
    y += 8;

    doc.setTextColor(...C.navy);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(co.name.toUpperCase(), PW / 2, y, { align: "center" });
  }

  // Add footers & bg to all content pages
  const pages = doc.getNumberOfPages();
  for (let i = 2; i <= pages; i++) {
    doc.setPage(i);
    // Light bg on content pages
    drawFooter(doc, i - 1, pages - 1, co);
  }

  doc.save(`Quotation_${data.client_name.replace(/\s+/g, "_")}_${data.destination_name.replace(/\s+/g, "_")}.pdf`);
}
