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
const HEADER_H = 46;
const MINI_HEADER_H = 18;
const FOOTER_H = 22;

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

function addFullHeader(doc: jsPDF, logoBase64: string | null, company: CompanyInfo) {
  const headerHeight = 40;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, headerHeight, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, headerHeight, PAGE_W, 1.2, "F");

  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", MARGIN, 6, 22, 22); } catch {}
  }

  const textX = logoBase64 ? MARGIN + 26 : MARGIN;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, textX, 17);

  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(company.tagline.toUpperCase(), textX, 23);

  const rightX = PAGE_W - MARGIN;
  doc.setFontSize(6.5);
  doc.setTextColor(200, 205, 220);
  const addrLines = doc.splitTextToSize(company.address, 75);
  addrLines.forEach((line: string, i: number) => {
    doc.text(line, rightX, 14 + i * 3.5, { align: "right" });
  });
}

function addMiniHeader(doc: jsPDF, logoBase64: string | null, company: CompanyInfo) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, MINI_HEADER_H, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, MINI_HEADER_H, PAGE_W, 0.8, "F");

  if (logoBase64) {
    try { doc.addImage(logoBase64, "PNG", MARGIN, 3, 12, 12); } catch {}
  }

  const textX = logoBase64 ? MARGIN + 15 : MARGIN;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(company.name, textX, 11);
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number, company: CompanyInfo) {
  const footerY = PAGE_H - FOOTER_H;
  doc.setFillColor(...GOLD);
  doc.rect(0, footerY, PAGE_W, 0.8, "F");
  doc.setFillColor(...NAVY);
  doc.rect(0, footerY + 0.8, PAGE_W, FOOTER_H - 0.8, "F");

  const y1 = footerY + 7;
  const y2 = footerY + 12;
  const y3 = footerY + 17;

  doc.setTextColor(200, 205, 220);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Phone: ${company.phone}  |  Email: ${company.email}`, PAGE_W / 2, y1, { align: "center" });
  doc.text(`Website: ${company.website}  |  Instagram: ${company.instagram}`, PAGE_W / 2, y2, { align: "center" });

  doc.setTextColor(140, 145, 160);
  doc.setFontSize(5.5);
  doc.text(company.address, PAGE_W / 2, y3, { align: "center" });

  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y1, { align: "right" });
}

function addWatermark(doc: jsPDF, logoBase64: string | null, company: CompanyInfo) {
  const gState = (doc as any).GState({ opacity: 0.04 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", PAGE_W / 2 - 35, PAGE_H / 2 - 35, 70, 70);
      doc.restoreGraphicsState();
      return;
    } catch {}
  }
  doc.setTextColor(150, 155, 170);
  doc.setFontSize(55);
  doc.setFont("helvetica", "bold");
  doc.text(company.name.toUpperCase(), PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

function checkPage(doc: jsPDF, y: number, needed: number, logo: string | null, company: CompanyInfo, showWatermark: boolean): number {
  if (y + needed > PAGE_H - FOOTER_H - 10) {
    doc.addPage();
    addMiniHeader(doc, logo, company);
    if (showWatermark) addWatermark(doc, logo, company);
    return MINI_HEADER_H + 8;
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

function numberedList(doc: jsPDF, items: string[], y: number, logo: string | null, company: CompanyInfo, showWatermark: boolean, color: [number, number, number] = GOLD): number {
  doc.setFontSize(7.5);
  items.forEach((note, idx) => {
    if (!note.trim()) return;
    y = checkPage(doc, y, 8, logo, company, showWatermark);
    doc.setFillColor(...color);
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
  return y;
}

// ─── Main Export ───
export async function generateQuotationPDF(data: QuotationForPDF) {
  const logo = await loadLogoBase64();
  const doc = new jsPDF("p", "mm", "a4");
  const company = data.company || DEFAULT_COMPANY;
  const sections = data.sections || DEFAULT_SECTION_TOGGLES;
  const showWM = sections.show_watermark;

  // ===== PAGE 1 =====
  addFullHeader(doc, logo, company);
  if (showWM) addWatermark(doc, logo, company);

  let y = HEADER_H + 8;

  // 1) Destination Name
  doc.setTextColor(...NAVY);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  const destTitle = data.destination_name.toUpperCase();
  doc.text(destTitle, PAGE_W / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(24);
  const tw = Math.min(doc.getTextWidth(destTitle) / 2 + 5, CONTENT_W / 2 - 5);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(PAGE_W / 2 - tw, y, PAGE_W / 2 - 4, y);
  doc.line(PAGE_W / 2 + 4, y, PAGE_W / 2 + tw, y);
  doc.setFillColor(...GOLD);
  doc.circle(PAGE_W / 2, y, 1.2, "F");
  y += 6;

  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("TOUR PACKAGE", PAGE_W / 2, y, { align: "center" });
  y += 8;

  // 2) Cities Covered
  if (sections.show_cities) {
    const cities = data.cities_covered?.filter((c) => c.trim()) || [];
    if (cities.length > 0) {
      const citiesText = cities.join(" / ");
      doc.setTextColor(...NAVY);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(citiesText, PAGE_W / 2, y, { align: "center" });
      y += 8;
    }
  }

  // Duration & Pax badge
  if (data.days.length > 0) {
    const nights = data.days.length > 1 ? data.days.length - 1 : 0;
    const totalPax = (data.num_persons || 0) + (data.num_children || 0);
    const durText = `${data.days.length} Days & ${nights} Nights  |  ${totalPax} Pax`;
    const bw = 90;
    doc.setFillColor(...GOLD);
    doc.roundedRect(PAGE_W / 2 - bw / 2, y - 5, bw, 11, 5.5, 5.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(durText, PAGE_W / 2, y + 2, { align: "center" });
    y += 16;
  }

  // 3) Guest Info Card
  const cardH = 34;
  doc.setFillColor(225, 228, 236);
  doc.roundedRect(MARGIN + 1.5, y - 2.5, CONTENT_W, cardH, 3, 3, "F");
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, cardH, 3, 3, "F");
  doc.setDrawColor(215, 218, 228);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, cardH, 3, 3, "S");
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN + 8, y - 4, CONTENT_W - 16, 1.5, "F");

  const lx = MARGIN + 8;
  const vx = MARGIN + 44;
  const rx = PAGE_W / 2 + 6;
  const rvx = PAGE_W / 2 + 40;

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

  ry += 5;
  doc.setDrawColor(...GOLD_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(lx, ry, PAGE_W - MARGIN - 8, ry);

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

  const totalPax = (data.num_persons || 0) + (data.num_children || 0);
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("NO. OF PAX", rx, ry);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const paxParts: string[] = [];
  if (data.num_persons > 0) paxParts.push(`${data.num_persons} ${data.person_label || "Adult"}`);
  if ((data.num_children || 0) > 0) paxParts.push(`${data.num_children} ${data.child_label || "Child"}`);
  doc.text(paxParts.join(" + ") || `${totalPax}`, rvx, ry);

  y += cardH + 8;

  // Description
  if (sections.show_description && data.description) {
    y = checkPage(doc, y, 15, logo, company, showWM);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const dLines = doc.splitTextToSize(data.description, CONTENT_W - 4);
    dLines.forEach((line: string) => {
      y = checkPage(doc, y, 5, logo, company, showWM);
      doc.text(line, MARGIN + 2, y);
      y += 4.5;
    });
    y += 8;
  }

  // 4) Brief Itinerary
  if (sections.show_brief_itinerary) {
    const briefs = data.brief_itinerary?.filter((b) => b.description?.trim()) || [];
    if (briefs.length > 0) {
      y = checkPage(doc, y, 22, logo, company, showWM);
      y = sectionTitle(doc, "Brief Itinerary", y);

      briefs.forEach((b, idx) => {
        y = checkPage(doc, y, 7, logo, company, showWM);
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(MARGIN, y - 3.5, CONTENT_W, 7, "F");
        }
        doc.setTextColor(...NAVY);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(`Day ${b.day}`, MARGIN + 4, y);
        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.text(b.description, MARGIN + 22, y);
        y += 6;
      });
      y += 8;
    }
  }

  // 5) Hotel Details
  if (sections.show_hotel_details) {
    const hotels = data.hotel_details?.filter((h) => h.city?.trim() || h.hotel_name?.trim()) || [];
    if (hotels.length > 0) {
      y = checkPage(doc, y, 30, logo, company, showWM);
      y = sectionTitle(doc, "Hotel Details", y);

      const tX = MARGIN;
      const tW = CONTENT_W;
      const rowH = 8;

      doc.setFillColor(...NAVY);
      doc.roundedRect(tX, y, tW, rowH, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("CITY", tX + 4, y + 5.5);
      doc.text("HOTEL NAME", tX + tW * 0.25, y + 5.5);
      doc.text("ROOM TYPE", tX + tW * 0.6, y + 5.5);
      doc.text("NIGHTS", tX + tW - 6, y + 5.5, { align: "right" });
      y += rowH;

      hotels.forEach((h, idx) => {
        y = checkPage(doc, y, rowH, logo, company, showWM);
        const bg = idx % 2 === 0 ? LIGHT_BG : WHITE;
        doc.setFillColor(...bg);
        doc.rect(tX, y, tW, rowH, "F");
        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.15);
        doc.rect(tX, y, tW, rowH, "S");

        doc.setTextColor(...DARK);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(h.city || "", tX + 4, y + 5.5);
        doc.text(h.hotel_name || "", tX + tW * 0.25, y + 5.5);
        doc.text(h.room_type || "", tX + tW * 0.6, y + 5.5);
        doc.setFont("helvetica", "bold");
        doc.text(`${h.nights || 0}`, tX + tW - 6, y + 5.5, { align: "right" });
        y += rowH;
      });
      y += 10;
    }
  }

  // 6) Detailed Itinerary
  if (sections.show_detailed_itinerary && data.days.length > 0) {
    y = checkPage(doc, y, 30, logo, company, showWM);
    doc.setTextColor(...NAVY);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED ITINERARY", PAGE_W / 2, y, { align: "center" });
    y += 4;
    y = goldDivider(doc, y);
    y += 4;

    data.days.forEach((day, idx) => {
      y = checkPage(doc, y, 28, logo, company, showWM);

      doc.setFillColor(...GOLD);
      doc.circle(MARGIN + 6, y, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${day.day}`, MARGIN + 6, y + 1.5, { align: "center" });

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
        y = checkPage(doc, y, dh, logo, company, showWM);

        doc.setFillColor(...LIGHT_BG);
        doc.roundedRect(MARGIN + 14, y - 3, CONTENT_W - 14, dh, 1.5, 1.5, "F");
        doc.setFillColor(...GOLD_LIGHT);
        doc.rect(MARGIN + 14, y - 3, 1.5, dh, "F");

        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        dLines.forEach((line: string) => {
          y = checkPage(doc, y, 5, logo, company, showWM);
          doc.text(line, MARGIN + 19, y + 1);
          y += 4.5;
        });
        y += 4;
      }

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
    y += 6;
  }

  // 7) Inclusions
  if (sections.show_inclusions && data.inclusions.length > 0 && data.inclusions.some((s) => s.trim())) {
    y = checkPage(doc, y, 22, logo, company, showWM);
    y = sectionTitle(doc, "Inclusions", y);

    data.inclusions.forEach((item, idx) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CONTENT_W - 14);
      const bh = lines.length * 4.5 + 2;
      y = checkPage(doc, y, bh, logo, company, showWM);

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

  // Exclusions
  if (sections.show_exclusions && data.exclusions.length > 0 && data.exclusions.some((s) => s.trim())) {
    y = checkPage(doc, y, 22, logo, company, showWM);
    y = sectionTitle(doc, "Exclusions", y);

    data.exclusions.forEach((item, idx) => {
      if (!item.trim()) return;
      const lines = doc.splitTextToSize(item, CONTENT_W - 14);
      const bh = lines.length * 4.5 + 2;
      y = checkPage(doc, y, bh, logo, company, showWM);

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

  // 8) Total Package Amount
  if (sections.show_pricing_table) {
    const pricingRows: { label: string; rate: number; qty: number; amount: number }[] = [];
    if (data.price_per_person > 0 && data.num_persons > 0) {
      pricingRows.push({ label: data.person_label || "Adult", rate: data.price_per_person, qty: data.num_persons, amount: data.price_per_person * data.num_persons });
    }
    if ((data.price_per_child || 0) > 0 && (data.num_children || 0) > 0) {
      pricingRows.push({ label: data.child_label || "Child", rate: data.price_per_child!, qty: data.num_children!, amount: data.price_per_child! * data.num_children! });
    }

    if (pricingRows.length > 0) {
      y = checkPage(doc, y, 45, logo, company, showWM);
      y = sectionTitle(doc, "Total Package Amount", y);

      const tX = MARGIN;
      const tW = CONTENT_W;
      const rowH = 9;

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

      doc.setFillColor(...NAVY);
      doc.roundedRect(tX, y, tW, rowH + 1, 1.5, 1.5, "F");
      doc.setTextColor(...GOLD);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL", tX + 6, y + 6.5);
      doc.text(formatINR(data.total_price), tX + tW - 6, y + 6.5, { align: "right" });
      y += rowH + 10;
    }
  }

  // 9) Terms & Conditions
  if (sections.show_terms_conditions) {
    const terms = data.terms_conditions?.length && data.terms_conditions.some((t) => t.trim())
      ? data.terms_conditions.filter((t) => t.trim())
      : DEFAULT_TERMS;

    y = checkPage(doc, y, 30, logo, company, showWM);
    y = sectionTitle(doc, "Terms & Conditions", y);
    y = numberedList(doc, terms, y, logo, company, showWM, GOLD);
    y += 6;
  }

  // 10) Important Notes
  if (sections.show_important_notes) {
    const notes = data.important_notes?.filter((n) => n.trim()) || [];
    if (notes.length > 0) {
      y = checkPage(doc, y, 20, logo, company, showWM);
      y = sectionTitle(doc, "Important Notes", y);
      y = numberedList(doc, notes, y, logo, company, showWM, NAVY);
      y += 6;
    }
  }

  // 11) Bank Details
  if (sections.show_bank_details && data.bank_details?.trim()) {
    y = checkPage(doc, y, 30, logo, company, showWM);
    y = sectionTitle(doc, "Bank Details", y);

    doc.setFillColor(...LIGHT_BG);
    const bankLines = data.bank_details.split("\n");
    const bankH = bankLines.length * 5 + 6;
    doc.roundedRect(MARGIN, y - 2, CONTENT_W, bankH, 2, 2, "F");
    doc.setFillColor(...GOLD);
    doc.rect(MARGIN, y - 2, 2, bankH, "F");

    doc.setTextColor(...DARK);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    bankLines.forEach((line) => {
      doc.text(line, MARGIN + 8, y + 3);
      y += 5;
    });
    y += 10;
  }

  // Closing message
  if (sections.show_closing_message) {
    y = checkPage(doc, y, 20, logo, company, showWM);
    y += 6;
    const closingMsg = data.closing_message || `Thank you for choosing ${company.name}!`;
    doc.setTextColor(...NAVY);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(closingMsg, PAGE_W / 2, y, { align: "center" });
    y += 6;
    doc.setTextColor(...GOLD);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("We look forward to creating unforgettable memories for you.", PAGE_W / 2, y, { align: "center" });
  }

  // ===== Footers =====
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages, company);
  }

  doc.save(`Quotation_${data.client_name.replace(/\s+/g, "_")}_${data.destination_name.replace(/\s+/g, "_")}.pdf`);
}
