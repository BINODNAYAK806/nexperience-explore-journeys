import jsPDF from "jspdf";
import { format } from "date-fns";

interface QuotationForPDF {
  client_name: string;
  client_contact?: string;
  destination_name: string;
  total_price: number;
  price_per_person: number;
  num_persons: number;
  person_label: string;
  travel_start_date: string;
  travel_end_date?: string;
  description: string;
  days: { day: number; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
}

// Premium color palette
const NAVY: [number, number, number] = [15, 32, 65];
const GOLD: [number, number, number] = [198, 160, 90];
const GOLD_LIGHT: [number, number, number] = [240, 225, 190];
const DARK: [number, number, number] = [30, 30, 35];
const GRAY: [number, number, number] = [110, 115, 125];
const LIGHT_BG: [number, number, number] = [248, 249, 252];
const WHITE: [number, number, number] = [255, 255, 255];
const SUCCESS: [number, number, number] = [34, 139, 80];
const DANGER: [number, number, number] = [180, 50, 40];
const BLUE_ACCENT: [number, number, number] = [0, 90, 180];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COMPANY_INFO = {
  name: "NexYatra",
  tagline: "Premium Travel Experiences",
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

const HEADER_H = 38;
const FOOTER_H = 24;

function addHeader(doc: jsPDF, logoBase64: string | null) {
  // Navy header with subtle gradient effect
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 34, "F");

  // Gold accent strip
  doc.setFillColor(...GOLD);
  doc.rect(0, 34, PAGE_W, 1.2, "F");

  // Thin light line below gold
  doc.setFillColor(...GOLD_LIGHT);
  doc.rect(0, 35.2, PAGE_W, 0.4, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN, 5, 22, 22);
    } catch { /* fallback */ }
  }

  // Company name - elegant typography
  const textX = logoBase64 ? MARGIN + 26 : MARGIN;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(COMPANY_INFO.name, textX, 16);

  // Tagline
  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(COMPANY_INFO.tagline.toUpperCase(), textX, 22);

  // Right side - contact details with icons
  const rightX = PAGE_W - MARGIN;
  doc.setTextColor(220, 225, 235);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`☎  ${COMPANY_INFO.phone}`, rightX, 11, { align: "right" });
  doc.text(`✉  ${COMPANY_INFO.email}`, rightX, 16, { align: "right" });
  doc.text(`⌂  ${COMPANY_INFO.website}`, rightX, 21, { align: "right" });

  doc.setFontSize(5.5);
  doc.setTextColor(170, 175, 190);
  const addrLines = doc.splitTextToSize(COMPANY_INFO.address, 65);
  addrLines.forEach((line: string, i: number) => {
    doc.text(line, rightX, 26 + i * 2.8, { align: "right" });
  });
}

function addWatermark(doc: jsPDF, logoBase64: string | null) {
  if (logoBase64) {
    try {
      const gState = (doc as any).GState({ opacity: 0.04 });
      doc.saveGraphicsState();
      doc.setGState(gState);
      doc.addImage(logoBase64, "PNG", PAGE_W / 2 - 35, PAGE_H / 2 - 35, 70, 70);
      doc.restoreGraphicsState();
    } catch {
      addTextWatermark(doc);
    }
  } else {
    addTextWatermark(doc);
  }
}

function addTextWatermark(doc: jsPDF) {
  const gState = (doc as any).GState({ opacity: 0.04 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  doc.setTextColor(150, 155, 170);
  doc.setFontSize(55);
  doc.setFont("helvetica", "bold");
  doc.text("NEXYATRA", PAGE_W / 2, PAGE_H / 2, { align: "center", angle: 45 });
  doc.restoreGraphicsState();
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  // Gold line
  doc.setFillColor(...GOLD);
  doc.rect(0, PAGE_H - 22, PAGE_W, 0.8, "F");

  // Navy footer
  doc.setFillColor(...NAVY);
  doc.rect(0, PAGE_H - 21.2, PAGE_W, 21.2, "F");

  // Small gold ornament
  doc.setFillColor(...GOLD);
  doc.rect(PAGE_W / 2 - 15, PAGE_H - 22, 30, 0.8, "F");

  doc.setTextColor(200, 205, 215);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");

  const footerY = PAGE_H - 13;
  doc.text(`${COMPANY_INFO.name}  •  ${COMPANY_INFO.phone}  •  ${COMPANY_INFO.email}`, PAGE_W / 2, footerY, { align: "center" });
  
  doc.setFontSize(5.5);
  doc.setTextColor(140, 145, 160);
  doc.text(COMPANY_INFO.website, PAGE_W / 2, footerY + 4, { align: "center" });

  // Page number with elegant styling
  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, footerY, { align: "right" });
}

function checkPage(doc: jsPDF, y: number, needed: number, logoBase64: string | null): number {
  if (y + needed > PAGE_H - FOOTER_H - 8) {
    doc.addPage();
    addHeader(doc, logoBase64);
    addWatermark(doc, logoBase64);
    return HEADER_H + 8;
  }
  return y;
}

function drawSectionTitle(doc: jsPDF, title: string, y: number): number {
  // Elegant section header with left gold bar
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y - 5, CONTENT_W, 10, 2, 2, "F");
  
  // Gold left accent bar
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN, y - 5, 3, 10, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), MARGIN + 8, y + 1.5);

  // Gold diamond ornament on right
  doc.setTextColor(...GOLD);
  doc.setFontSize(8);
  doc.text("◆", PAGE_W - MARGIN - 6, y + 1.5);

  return y + 12;
}

function drawDivider(doc: jsPDF, y: number): number {
  doc.setDrawColor(...GOLD_LIGHT);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 10, y, PAGE_W - MARGIN - 10, y);
  return y + 4;
}

export async function generateQuotationPDF(data: QuotationForPDF) {
  const logoBase64 = await loadLogoBase64();
  const doc = new jsPDF("p", "mm", "a4");

  // ===== PAGE 1: Cover =====
  addHeader(doc, logoBase64);
  addWatermark(doc, logoBase64);

  let y = HEADER_H + 14;

  // Destination title - large, premium
  doc.setTextColor(...NAVY);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  const destTitle = data.destination_name.toUpperCase();
  doc.text(destTitle, PAGE_W / 2, y, { align: "center" });

  // Gold ornamental line under title
  y += 5;
  doc.setFontSize(22);
  const titleW = doc.getTextWidth(destTitle);
  const lineHalfW = Math.min(titleW / 2 + 5, CONTENT_W / 2 - 5);
  
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(PAGE_W / 2 - lineHalfW, y, PAGE_W / 2 - 4, y);
  doc.line(PAGE_W / 2 + 4, y, PAGE_W / 2 + lineHalfW, y);
  
  // Center diamond
  doc.setTextColor(...GOLD);
  doc.setFontSize(7);
  doc.text("◆", PAGE_W / 2, y + 1, { align: "center" });

  // Tour Package subtitle
  y += 8;
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("TOUR PACKAGE", PAGE_W / 2, y, { align: "center" });

  // Duration badge
  y += 10;
  if (data.days.length > 0) {
    const nights = data.days.length > 1 ? data.days.length - 1 : 0;
    const durationText = `${data.days.length} Days  &  ${nights} Nights`;
    
    // Gold badge background
    const badgeW = 70;
    doc.setFillColor(...GOLD);
    doc.roundedRect(PAGE_W / 2 - badgeW / 2, y - 5, badgeW, 11, 5.5, 5.5, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(durationText, PAGE_W / 2, y + 2, { align: "center" });
    y += 14;
  }

  // ---- Client Info Card ----
  // Card shadow effect
  doc.setFillColor(230, 232, 240);
  doc.roundedRect(MARGIN + 1, y - 3, CONTENT_W, 40, 3, 3, "F");
  // Card background
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, 40, 3, 3, "F");
  // Card border
  doc.setDrawColor(220, 222, 230);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_W, 40, 3, 3, "S");
  // Top gold accent
  doc.setFillColor(...GOLD);
  doc.rect(MARGIN + 8, y - 4, CONTENT_W - 16, 1.5, "F");

  const labelX = MARGIN + 8;
  const valueX = MARGIN + 42;
  const col2LabelX = PAGE_W / 2 + 5;
  const col2ValueX = PAGE_W / 2 + 38;

  doc.setFontSize(8.5);

  // Row 1
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("GUEST NAME", labelX, y + 6);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.client_name, valueX, y + 6);

  if (data.client_contact) {
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT", col2LabelX, y + 6);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.client_contact, col2ValueX, y + 6);
  }

  // Separator line
  doc.setDrawColor(...GOLD_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(labelX, y + 11, PAGE_W - MARGIN - 8, y + 11);

  // Row 2
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("TRAVEL DATE", labelX, y + 18);
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const dateStr = data.travel_start_date
    ? format(new Date(data.travel_start_date), "dd MMM yyyy")
    : "TBD";
  const endDateStr = data.travel_end_date
    ? ` — ${format(new Date(data.travel_end_date), "dd MMM yyyy")}`
    : "";
  doc.text(dateStr + endDateStr, valueX, y + 18);

  // Separator
  doc.line(labelX, y + 23, PAGE_W - MARGIN - 8, y + 23);

  // Row 3 - Price (highlighted)
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PRICE", labelX, y + 30);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`₹ ${data.total_price.toLocaleString("en-IN")}`, valueX, y + 30);

  // Pricing breakdown on same row
  if (data.price_per_person > 0 && data.num_persons > 0) {
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    const label = data.person_label || "Person";
    doc.text(
      `( ${data.num_persons} ${label} × ₹${data.price_per_person.toLocaleString("en-IN")} )`,
      col2LabelX, y + 30
    );
  }

  y += 44;

  // Description
  if (data.description) {
    y = checkPage(doc, y, 15, logoBase64);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(data.description, CONTENT_W - 4);
    descLines.forEach((line: string) => {
      y = checkPage(doc, y, 5, logoBase64);
      doc.text(line, MARGIN + 2, y);
      y += 4.5;
    });
    y += 5;
  }

  // ---- Inclusions ----
  if (data.inclusions.length > 0) {
    y = checkPage(doc, y, 20, logoBase64);
    y = drawSectionTitle(doc, "Price Includes", y);

    data.inclusions.forEach((item, idx) => {
      y = checkPage(doc, y, 6, logoBase64);
      
      // Alternating row background
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(MARGIN, y - 3.5, CONTENT_W, 6, "F");
      }

      // Green bullet
      doc.setFillColor(...SUCCESS);
      doc.circle(MARGIN + 5, y - 0.5, 1.2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.text("✓", MARGIN + 4.2, y);

      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(item, MARGIN + 10, y);
      y += 5.5;
    });
    y += 4;
  }

  // ---- Exclusions ----
  if (data.exclusions.length > 0) {
    y = checkPage(doc, y, 20, logoBase64);
    y = drawSectionTitle(doc, "Price Excludes", y);

    data.exclusions.forEach((item, idx) => {
      y = checkPage(doc, y, 6, logoBase64);
      
      if (idx % 2 === 0) {
        doc.setFillColor(252, 248, 248);
        doc.rect(MARGIN, y - 3.5, CONTENT_W, 6, "F");
      }

      // Red bullet
      doc.setFillColor(...DANGER);
      doc.circle(MARGIN + 5, y - 0.5, 1.2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.text("✗", MARGIN + 4.2, y);

      doc.setTextColor(...DARK);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(item, MARGIN + 10, y);
      y += 5.5;
    });
    y += 4;
  }

  // ===== ITINERARY PAGES =====
  if (data.days.length > 0) {
    doc.addPage();
    addHeader(doc, logoBase64);
    addWatermark(doc, logoBase64);
    y = HEADER_H + 8;

    // Itinerary page title
    doc.setTextColor(...NAVY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED ITINERARY", PAGE_W / 2, y, { align: "center" });
    y += 3;
    y = drawDivider(doc, y);
    y += 4;

    data.days.forEach((day, idx) => {
      y = checkPage(doc, y, 25, logoBase64);

      // Day number badge (circle)
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
      y += 10;

      if (day.description) {
        // Light card for description
        doc.setFillColor(...LIGHT_BG);
        const descLines = doc.splitTextToSize(day.description, CONTENT_W - 22);
        const descHeight = descLines.length * 4.5 + 4;
        doc.roundedRect(MARGIN + 14, y - 2, CONTENT_W - 14, descHeight, 1.5, 1.5, "F");
        
        // Left border accent
        doc.setFillColor(...GOLD_LIGHT);
        doc.rect(MARGIN + 14, y - 2, 1.5, descHeight, "F");

        doc.setTextColor(...DARK);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        descLines.forEach((line: string) => {
          y = checkPage(doc, y, 5, logoBase64);
          doc.text(line, MARGIN + 19, y + 1);
          y += 4.5;
        });
        y += 2;
      }

      // Connector line between days
      if (idx < data.days.length - 1) {
        doc.setDrawColor(...GOLD_LIGHT);
        doc.setLineWidth(0.4);
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(MARGIN + 6, y, MARGIN + 6, y + 5);
        doc.setLineDashPattern([], 0);
        y += 6;
      } else {
        y += 4;
      }
    });
  }

  // ===== PRICING BREAKDOWN =====
  if (data.price_per_person > 0 && data.num_persons > 0) {
    y = checkPage(doc, y, 30, logoBase64);
    y = drawSectionTitle(doc, "Pricing Breakdown", y);

    // Pricing table
    const tableX = MARGIN;
    const tableW = CONTENT_W;
    const rowH = 9;

    // Table header
    doc.setFillColor(...NAVY);
    doc.roundedRect(tableX, y - 3, tableW, rowH, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", tableX + 5, y + 2.5);
    doc.text("RATE", tableX + tableW * 0.5, y + 2.5);
    doc.text("QTY", tableX + tableW * 0.7, y + 2.5);
    doc.text("AMOUNT", tableX + tableW - 5, y + 2.5, { align: "right" });
    y += rowH;

    // Data row
    doc.setFillColor(...LIGHT_BG);
    doc.rect(tableX, y - 3, tableW, rowH, "F");
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.2);
    doc.rect(tableX, y - 3, tableW, rowH, "S");

    const label = data.person_label || "Person";
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.num_persons} ${label}`, tableX + 5, y + 2.5);
    doc.text(`₹ ${data.price_per_person.toLocaleString("en-IN")}`, tableX + tableW * 0.5, y + 2.5);
    doc.text(`${data.num_persons}`, tableX + tableW * 0.7, y + 2.5);
    doc.setFont("helvetica", "bold");
    doc.text(`₹ ${data.total_price.toLocaleString("en-IN")}`, tableX + tableW - 5, y + 2.5, { align: "right" });
    y += rowH;

    // Total row
    doc.setFillColor(...NAVY);
    doc.roundedRect(tableX, y - 3, tableW, rowH + 1, 1.5, 1.5, "F");
    doc.setTextColor(...GOLD);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", tableX + 5, y + 3);
    doc.text(`₹ ${data.total_price.toLocaleString("en-IN")}`, tableX + tableW - 5, y + 3, { align: "right" });
    y += rowH + 6;
  }

  // ===== NOTE SECTION =====
  y = checkPage(doc, y, 35, logoBase64);
  y = drawSectionTitle(doc, "Important Notes", y);

  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  const notes = [
    "The tour is Private Tours, means there is no other participant, just only you and your companions.",
    "Time and Tourism site is subject to change based on your request.",
    "The price already includes applicable Government taxes and Services.",
    "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
  ];
  notes.forEach((note, idx) => {
    y = checkPage(doc, y, 6, logoBase64);
    doc.setTextColor(...GOLD);
    doc.setFontSize(6);
    doc.text("●", MARGIN + 3, y);
    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(note, CONTENT_W - 10);
    noteLines.forEach((line: string) => {
      doc.text(line, MARGIN + 8, y);
      y += 3.8;
    });
    y += 1;
  });

  // ===== Thank you message =====
  y = checkPage(doc, y, 15, logoBase64);
  y += 5;
  doc.setTextColor(...NAVY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for choosing NexYatra!", PAGE_W / 2, y, { align: "center" });
  y += 5;
  doc.setTextColor(...GOLD);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("We look forward to creating unforgettable memories for you.", PAGE_W / 2, y, { align: "center" });

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
