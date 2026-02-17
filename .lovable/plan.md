

# Dynamic Itinerary & Quotation Builder

## Overview
Add a complete quotation builder system to the Nexyatra admin dashboard. Admins will create reusable "Master Templates" for destinations (with day-by-day itineraries), then generate client-specific quotations by cloning a template, customizing the content inline, and exporting a branded PDF.

## Database Schema

Two new tables will be created:

**`itinerary_templates`** (Master Templates)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| destination_name | text | e.g. "Kerala Backwaters" |
| title | text | Template title |
| description | text | Default overview text with optional placeholders like `{{CLIENT_NAME}}`, `{{START_DATE}}` |
| days | jsonb | Array of day objects: `[{ day: 1, title: "Arrival in Kochi", description: "..." }, ...]` |
| default_inclusions | jsonb | Array of strings |
| default_exclusions | jsonb | Array of strings |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

**`quotations`** (Generated Quotations / Instances)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | auto-generated |
| template_id | uuid (FK) | References itinerary_templates.id, nullable (for fully custom quotes) |
| client_name | text | |
| client_contact | text | nullable |
| destination_name | text | |
| total_price | numeric | |
| travel_start_date | date | |
| travel_end_date | date | nullable |
| description | text | Cloned + edited overview |
| days | jsonb | Cloned + edited day-by-day itinerary |
| inclusions | jsonb | |
| exclusions | jsonb | |
| status | text | default 'draft' (draft / sent / accepted) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Both tables will have RLS policies restricting all operations to admin users only.

## Frontend Architecture

### New Files

1. **`src/pages/QuotationBuilder.tsx`** -- Main page with two sub-views managed by local state:
   - Template Manager (CRUD for master templates)
   - Quotation Creator/Editor

2. **`src/components/dashboard/quotations/TemplateManager.tsx`** -- List, create, edit, delete master templates. Each template has a "Create Quotation" button.

3. **`src/components/dashboard/quotations/TemplateForm.tsx`** -- Form for creating/editing a master template. Includes dynamic day-card management (add/remove/reorder days).

4. **`src/components/dashboard/quotations/QuotationEditor.tsx`** -- The main quotation builder UI:
   - Header section: Client Name, Contact, Total Price, Travel Dates (using date pickers)
   - "Load Template" dropdown to clone a master template's data into the form
   - Day-by-day itinerary cards with inline-editable text areas
   - Add/Remove day buttons
   - Inclusions/Exclusions editable lists
   - Variable injection: auto-replace `{{CLIENT_NAME}}`, `{{START_DATE}}`, `{{TOTAL_PRICE}}` placeholders when a template is loaded
   - "Save as Draft" and "Generate PDF" buttons

5. **`src/components/dashboard/quotations/QuotationsList.tsx`** -- Table of previously generated quotations with status, client name, destination, date, and actions (edit, download PDF, delete).

6. **`src/components/dashboard/quotations/QuotationPDF.tsx`** -- The PDF rendering logic using jsPDF. Generates a branded, print-ready PDF with:
   - Nexyatra header with logo on every page
   - Watermark: Nexyatra logo at center, opacity 0.1
   - Client info header block
   - Day-by-day itinerary sections
   - Inclusions/Exclusions section
   - Footer with contact info

### Dashboard Integration

A new tab "Quotations" will be added to `src/pages/Dashboard.tsx` alongside the existing Leads, Destinations, Reviews, and Contacts tabs.

### Routing

No new routes needed -- the quotation builder lives within the existing `/dashboard` protected route as a tab.

## PDF Generation

Will use **jsPDF** (client-side, no server dependency needed). The PDF layout will include:
- Page 1: Cover page with Nexyatra branding, client name, destination, dates, price
- Subsequent pages: Day-by-day itinerary cards styled with proper typography
- Every page: Header with Nexyatra logo, centered watermark at 10% opacity, footer with contact details
- Final page: Inclusions, exclusions, terms

## Master vs Instance Logic

When "Create Quotation from Template" is clicked:
1. The template's `days`, `description`, `inclusions`, `exclusions` are deep-cloned into the quotation form
2. Placeholders (`{{CLIENT_NAME}}`, `{{START_DATE}}`, `{{TOTAL_PRICE}}`) are replaced with actual values as the admin fills in the header fields
3. The master template is never modified -- all edits happen on the cloned quotation data
4. The quotation is saved independently with a reference back to `template_id`

## Implementation Steps

1. Run database migration to create `itinerary_templates` and `quotations` tables with admin-only RLS policies
2. Install jsPDF dependency
3. Create `TemplateForm.tsx` and `TemplateManager.tsx` for master template CRUD
4. Create `QuotationEditor.tsx` with inline editing, day management, and template loading
5. Create `QuotationPDF.tsx` with branded PDF generation logic
6. Create `QuotationsList.tsx` for viewing/managing saved quotations
7. Create `QuotationBuilder.tsx` page that ties the above components together with sub-navigation
8. Add "Quotations" tab to `Dashboard.tsx`

