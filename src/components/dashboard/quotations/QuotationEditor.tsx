import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, ArrowUp, ArrowDown, Save, FileDown, ChevronDown, ChevronRight,
  User, MapPin, Hotel, Calendar, IndianRupee, FileText, ListChecks, ListX,
  ScrollText, AlertTriangle, Building2, GripVertical, Settings2, Palette, MessageSquare,
  ImagePlus, X
} from "lucide-react";
import { generateQuotationPDF, DEFAULT_COMPANY, DEFAULT_SECTION_TOGGLES, DEFAULT_STYLE_CONFIG, COLOR_THEMES, type CompanyInfo, type PDFSectionToggles, type PDFStyleConfig, type PDFColorTheme, type PDFFontScale } from "./QuotationPDF";
import { format } from "date-fns";

interface DayItem { day: number; title: string; description: string; }
interface BriefItem { day: number; description: string; }
interface HotelItem { city: string; hotel_name: string; room_type: string; nights: number; }

export interface QuotationData {
  id?: string;
  template_id?: string | null;
  client_name: string;
  client_contact: string;
  destination_name: string;
  cities_covered: string[];
  total_price: number;
  price_per_person: number;
  num_persons: number;
  person_label: string;
  price_per_child: number;
  num_children: number;
  child_label: string;
  travel_start_date: string;
  travel_end_date: string;
  description: string;
  brief_itinerary: BriefItem[];
  hotel_details: HotelItem[];
  days: DayItem[];
  inclusions: string[];
  exclusions: string[];
  terms_conditions: string[];
  important_notes: string[];
  bank_details: string;
  status: string;
}

interface QuotationEditorProps {
  initialData?: QuotationData;
  preloadTemplate?: any;
  onSaved: () => void;
  onCancel: () => void;
}

const DEFAULT_TERMS = [
  "The tour is Private Tours, means there is no other participant, just only you and your companions.",
  "Time and Tourism site is subject to change based on your request.",
  "The price already includes applicable Government taxes and Services.",
  "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
];

const DEFAULT_BANK = `Bank Name: HDFC Bank\nAccount Name: NexYatra\nAccount No: XXXXXXXXXXXX\nIFSC: HDFC0XXXXXX\nBranch: Vesu, Surat`;

const emptyQuotation: QuotationData = {
  client_name: "", client_contact: "", destination_name: "",
  cities_covered: [""], total_price: 0, price_per_person: 0, num_persons: 2,
  person_label: "Adult", price_per_child: 0, num_children: 0, child_label: "Child",
  travel_start_date: "", travel_end_date: "", description: "",
  brief_itinerary: [{ day: 1, description: "" }],
  hotel_details: [{ city: "", hotel_name: "", room_type: "", nights: 1 }],
  days: [{ day: 1, title: "", description: "" }],
  inclusions: [""], exclusions: [""],
  terms_conditions: [...DEFAULT_TERMS], important_notes: [""],
  bank_details: DEFAULT_BANK, status: "draft",
};

// Collapsible Section wrapper
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, icon, badge, defaultOpen = false, children, actions }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <span className="text-muted-foreground">{icon}</span>
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
              </div>
              {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const QuotationEditor: React.FC<QuotationEditorProps> = ({ initialData, preloadTemplate, onSaved, onCancel }) => {
  const [form, setForm] = useState<QuotationData>(initialData || emptyQuotation);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ ...DEFAULT_COMPANY });
  const [sectionToggles, setSectionToggles] = useState<PDFSectionToggles>({ ...DEFAULT_SECTION_TOGGLES });
  const [closingMessage, setClosingMessage] = useState(`Thank you for choosing ${DEFAULT_COMPANY.name}!`);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("itinerary_templates").select("*").order("title").then(({ data }) => {
      setTemplates((data || []) as any[]);
    });
  }, []);

  useEffect(() => {
    if (preloadTemplate) loadTemplate(preloadTemplate);
  }, [preloadTemplate]);

  const recalcTotal = (pp: number, np: number, pc: number, nc: number) => pp * np + pc * nc;

  const injectVariables = (text: string) => {
    return text
      .replace(/\{\{CLIENT_NAME\}\}/g, form.client_name || "{{CLIENT_NAME}}")
      .replace(/\{\{START_DATE\}\}/g, form.travel_start_date ? format(new Date(form.travel_start_date), "dd MMM yyyy") : "{{START_DATE}}")
      .replace(/\{\{TOTAL_PRICE\}\}/g, form.total_price ? `Rs. ${form.total_price.toLocaleString("en-IN")}` : "{{TOTAL_PRICE}}");
  };

  const loadTemplate = (template: any) => {
    setForm((prev) => ({
      ...prev,
      template_id: template.id,
      destination_name: template.destination_name,
      description: template.description || "",
      cities_covered: template.cities_covered?.length ? [...template.cities_covered] : [""],
      days: JSON.parse(JSON.stringify(template.days || [])),
      brief_itinerary: template.default_brief_itinerary?.length ? JSON.parse(JSON.stringify(template.default_brief_itinerary)) : [{ day: 1, description: "" }],
      hotel_details: template.default_hotel_details?.length ? JSON.parse(JSON.stringify(template.default_hotel_details)) : [{ city: "", hotel_name: "", room_type: "", nights: 1 }],
      inclusions: template.default_inclusions?.length ? [...template.default_inclusions] : [""],
      exclusions: template.default_exclusions?.length ? [...template.default_exclusions] : [""],
      terms_conditions: template.default_terms_conditions?.length ? [...template.default_terms_conditions] : [...DEFAULT_TERMS],
      important_notes: template.default_important_notes?.length ? [...template.default_important_notes] : [""],
    }));
  };

  const updateField = (field: keyof QuotationData, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const updatePricing = (field: string, value: number) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      next.total_price = recalcTotal(next.price_per_person, next.num_persons, next.price_per_child, next.num_children);
      return next;
    });
  };

  // Day helpers
  const addDay = () => updateField("days", [...form.days, { day: form.days.length + 1, title: "", description: "" }]);
  const removeDay = (i: number) => updateField("days", form.days.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  const moveDay = (i: number, dir: "up" | "down") => {
    const arr = [...form.days];
    const t = dir === "up" ? i - 1 : i + 1;
    if (t < 0 || t >= arr.length) return;
    [arr[i], arr[t]] = [arr[t], arr[i]];
    updateField("days", arr.map((d, idx) => ({ ...d, day: idx + 1 })));
  };
  const updateDay = (i: number, field: "title" | "description", value: string) => {
    const updated = [...form.days];
    updated[i] = { ...updated[i], [field]: value };
    updateField("days", updated);
  };

  // Brief helpers
  const addBrief = () => updateField("brief_itinerary", [...form.brief_itinerary, { day: form.brief_itinerary.length + 1, description: "" }]);
  const removeBrief = (i: number) => updateField("brief_itinerary", form.brief_itinerary.filter((_, idx) => idx !== i).map((b, idx) => ({ ...b, day: idx + 1 })));
  const updateBrief = (i: number, value: string) => {
    const updated = [...form.brief_itinerary];
    updated[i] = { ...updated[i], description: value };
    updateField("brief_itinerary", updated);
  };

  // Hotel helpers
  const addHotel = () => updateField("hotel_details", [...form.hotel_details, { city: "", hotel_name: "", room_type: "", nights: 1 }]);
  const removeHotel = (i: number) => updateField("hotel_details", form.hotel_details.filter((_, idx) => idx !== i));
  const updateHotel = (i: number, field: keyof HotelItem, value: any) => {
    const updated = [...form.hotel_details];
    updated[i] = { ...updated[i], [field]: value };
    updateField("hotel_details", updated);
  };

  // Cities helpers
  const addCity = () => updateField("cities_covered", [...form.cities_covered, ""]);
  const removeCity = (i: number) => updateField("cities_covered", form.cities_covered.filter((_, idx) => idx !== i));
  const updateCity = (i: number, value: string) => {
    const updated = [...form.cities_covered];
    updated[i] = value;
    updateField("cities_covered", updated);
  };

  // List helpers
  const updateListItem = (field: "inclusions" | "exclusions" | "terms_conditions" | "important_notes", i: number, value: string) => {
    const updated = [...form[field]];
    updated[i] = value;
    updateField(field, updated);
  };
  const addListItem = (field: "inclusions" | "exclusions" | "terms_conditions" | "important_notes") => updateField(field, [...form[field], ""]);
  const removeListItem = (field: "inclusions" | "exclusions" | "terms_conditions" | "important_notes", i: number) => updateField(field, form[field].filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.client_name || !form.destination_name || !form.travel_start_date) {
      toast({ title: "Missing required fields", description: "Client name, destination, and start date are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        template_id: form.template_id || null,
        client_name: form.client_name,
        client_contact: form.client_contact || null,
        destination_name: form.destination_name,
        cities_covered: form.cities_covered.filter((s) => s.trim()),
        total_price: form.total_price,
        price_per_person: form.price_per_person,
        num_persons: form.num_persons,
        person_label: form.person_label,
        price_per_child: form.price_per_child,
        num_children: form.num_children,
        child_label: form.child_label,
        travel_start_date: form.travel_start_date,
        travel_end_date: form.travel_end_date || null,
        description: injectVariables(form.description) || null,
        brief_itinerary: form.brief_itinerary as unknown as import("@/integrations/supabase/types").Json,
        hotel_details: form.hotel_details as unknown as import("@/integrations/supabase/types").Json,
        days: form.days.map((d) => ({ ...d, title: injectVariables(d.title), description: injectVariables(d.description) })) as unknown as import("@/integrations/supabase/types").Json,
        inclusions: form.inclusions.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        exclusions: form.exclusions.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        terms_conditions: form.terms_conditions.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        important_notes: form.important_notes.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        bank_details: form.bank_details || null,
        status: form.status,
      };

      if (form.id) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotations").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Quotation saved successfully!" });
      onSaved();
    } catch (error: any) {
      toast({ title: "Error saving quotation", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    const injected = {
      ...form,
      description: injectVariables(form.description),
      days: form.days.map((d) => ({ ...d, title: injectVariables(d.title), description: injectVariables(d.description) })),
      company: companyInfo,
      sections: sectionToggles,
      closing_message: closingMessage,
      custom_logo: customLogo,
    };
    await generateQuotationPDF(injected);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCustomLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const numDisplay = (val: number) => (val === 0 ? "" : val);

  const filledSections = {
    client: !!(form.client_name && form.travel_start_date),
    cities: form.cities_covered.some(c => c.trim()),
    pricing: form.price_per_person > 0,
    brief: form.brief_itinerary.some(b => b.description.trim()),
    hotels: form.hotel_details.some(h => h.city.trim() || h.hotel_name.trim()),
    days: form.days.some(d => d.title.trim()),
    inclusions: form.inclusions.some(i => i.trim()),
    exclusions: form.exclusions.some(e => e.trim()),
  };

  return (
    <div className="space-y-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{form.id ? "Edit Quotation" : "New Quotation"}</h3>
            <Select value={form.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger className="w-[130px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">📝 Draft</SelectItem>
                <SelectItem value="sent">📤 Sent</SelectItem>
                <SelectItem value="accepted">✅ Accepted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
            <Button variant="secondary" size="sm" onClick={handleGeneratePDF} disabled={!form.client_name}>
              <FileDown className="h-4 w-4 mr-1" /> PDF
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* Quick Summary */}
        {form.client_name && (
          <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded">{form.client_name}</span>
            {form.destination_name && <span className="bg-muted px-2 py-1 rounded">{form.destination_name}</span>}
            {form.total_price > 0 && <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">₹{form.total_price.toLocaleString("en-IN")}</span>}
            {form.days.length > 0 && <span className="bg-muted px-2 py-1 rounded">{form.days.length}D/{form.days.length > 1 ? form.days.length - 1 : 0}N</span>}
          </div>
        )}
      </div>

      {/* Template Selector */}
      {!initialData && !preloadTemplate && (
        <Card>
          <CardContent className="py-4 px-4">
            <Label className="text-sm font-medium mb-2 block">Load from Master Template</Label>
            <Select onValueChange={(id) => {
              const t = templates.find((t) => t.id === id);
              if (t) loadTemplate(t);
            }}>
              <SelectTrigger><SelectValue placeholder="Select a template to pre-fill data..." /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.title} — {t.destination_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* 1. Client & Trip Info */}
      <Section title="Client & Trip Info" icon={<User className="h-4 w-4" />} defaultOpen={true}
        badge={filledSections.client ? "✓" : "Required"}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Client Name *</Label>
            <Input value={form.client_name} onChange={(e) => updateField("client_name", e.target.value)} placeholder="Guest full name" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Client Contact</Label>
            <Input value={form.client_contact} onChange={(e) => updateField("client_contact", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Destination *</Label>
            <Input value={form.destination_name} onChange={(e) => updateField("destination_name", e.target.value)} placeholder="e.g. Kashmir" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Travel Start Date *</Label>
            <Input type="date" value={form.travel_start_date} onChange={(e) => updateField("travel_start_date", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Travel End Date</Label>
            <Input type="date" value={form.travel_end_date} onChange={(e) => updateField("travel_end_date", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Description / Overview</Label>
            <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={2} placeholder="Brief tour overview..." />
          </div>
        </div>
      </Section>

      {/* 2. Cities Covered */}
      <Section title="Cities Covered" icon={<MapPin className="h-4 w-4" />}
        badge={`${form.cities_covered.filter(c => c.trim()).length} cities`}
        actions={<Button type="button" variant="outline" size="sm" onClick={addCity}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {form.cities_covered.map((city, i) => (
            <div key={i} className="flex gap-1">
              <Input value={city} onChange={(e) => updateCity(i, e.target.value)} placeholder="City name" className="h-9" />
              {form.cities_covered.length > 1 && (
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeCity(i)}><Trash2 className="h-3 w-3" /></Button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Pricing */}
      <Section title="Pricing" icon={<IndianRupee className="h-4 w-4" />} defaultOpen={true}
        badge={form.total_price > 0 ? `₹${form.total_price.toLocaleString("en-IN")}` : undefined}>
        <div className="space-y-4">
          {/* Adult Pricing Row */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Adult Pricing</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Price/Person (₹)</Label>
                <Input type="number" value={numDisplay(form.price_per_person)} onChange={(e) => updatePricing("price_per_person", Number(e.target.value))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">No. of Adults</Label>
                <Input type="number" value={numDisplay(form.num_persons)} onChange={(e) => updatePricing("num_persons", Number(e.target.value))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input value={form.person_label} onChange={(e) => updateField("person_label", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Child Pricing Row */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Child Pricing</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Price/Child (₹)</Label>
                <Input type="number" value={numDisplay(form.price_per_child)} onChange={(e) => updatePricing("price_per_child", Number(e.target.value))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">No. of Children</Label>
                <Input type="number" value={numDisplay(form.num_children)} onChange={(e) => updatePricing("num_children", Number(e.target.value))} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input value={form.child_label} onChange={(e) => updateField("child_label", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
            <span className="font-semibold text-sm">Total Package Amount</span>
            <span className="text-xl font-bold text-primary">₹{form.total_price.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </Section>

      {/* 4. Brief Itinerary */}
      <Section title="Brief Itinerary" icon={<Calendar className="h-4 w-4" />}
        badge={`${form.brief_itinerary.filter(b => b.description.trim()).length} days`}
        actions={<Button type="button" variant="outline" size="sm" onClick={addBrief}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="space-y-2">
          {form.brief_itinerary.map((b, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Badge variant="outline" className="shrink-0 w-14 justify-center">Day {b.day}</Badge>
              <Input value={b.description} onChange={(e) => updateBrief(i, e.target.value)} placeholder="e.g. Arrival in Srinagar, check-in to houseboat" className="h-9" />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeBrief(i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Hotel Details */}
      <Section title="Hotel Details" icon={<Hotel className="h-4 w-4" />}
        badge={`${form.hotel_details.filter(h => h.hotel_name.trim()).length} hotels`}
        actions={<Button type="button" variant="outline" size="sm" onClick={addHotel}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="space-y-3">
          {form.hotel_details.map((h, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-muted/30 rounded-lg items-end">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input value={h.city} onChange={(e) => updateHotel(i, "city", e.target.value)} placeholder="City" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hotel Name</Label>
                <Input value={h.hotel_name} onChange={(e) => updateHotel(i, "hotel_name", e.target.value)} placeholder="Hotel name" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Room Type</Label>
                <Input value={h.room_type} onChange={(e) => updateHotel(i, "room_type", e.target.value)} placeholder="Deluxe" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nights</Label>
                <Input type="number" value={h.nights} onChange={(e) => updateHotel(i, "nights", Number(e.target.value))} className="h-9" />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeHotel(i)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Detailed Itinerary */}
      <Section title="Detailed Itinerary" icon={<FileText className="h-4 w-4" />}
        badge={`${form.days.length} days`}
        actions={<Button type="button" variant="outline" size="sm" onClick={addDay}><Plus className="h-3 w-3 mr-1" /> Add Day</Button>}>
        <div className="space-y-3">
          {form.days.map((day, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-muted/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="default" className="text-xs">Day {day.day}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDay(i, "up")} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDay(i, "down")} disabled={i === form.days.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeDay(i)} disabled={form.days.length <= 1}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <Input placeholder="Day title (e.g. Arrival in Srinagar)" value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} className="h-9" />
                <Textarea placeholder="Detailed description of the day's activities..." value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} rows={3} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Inclusions */}
      <Section title="Inclusions" icon={<ListChecks className="h-4 w-4" />}
        badge={`${form.inclusions.filter(i => i.trim()).length} items`}
        actions={<Button type="button" variant="outline" size="sm" onClick={() => addListItem("inclusions")}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="space-y-2">
          {form.inclusions.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-green-500 shrink-0">✓</span>
              <Input value={item} onChange={(e) => updateListItem("inclusions", i, e.target.value)} placeholder="e.g. All meals included" className="h-9" />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeListItem("inclusions", i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Exclusions */}
      <Section title="Exclusions" icon={<ListX className="h-4 w-4" />}
        badge={`${form.exclusions.filter(e => e.trim()).length} items`}
        actions={<Button type="button" variant="outline" size="sm" onClick={() => addListItem("exclusions")}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="space-y-2">
          {form.exclusions.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-destructive shrink-0">✕</span>
              <Input value={item} onChange={(e) => updateListItem("exclusions", i, e.target.value)} placeholder="e.g. Airfare not included" className="h-9" />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeListItem("exclusions", i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </Section>

      {/* 9. Terms & Conditions */}
      <Section title="Terms & Conditions" icon={<ScrollText className="h-4 w-4" />}
        badge={`${form.terms_conditions.filter(t => t.trim()).length} terms`}
        actions={<Button type="button" variant="outline" size="sm" onClick={() => addListItem("terms_conditions")}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="space-y-2">
          {form.terms_conditions.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Badge variant="outline" className="shrink-0 mt-1">{i + 1}</Badge>
              <Textarea value={item} onChange={(e) => updateListItem("terms_conditions", i, e.target.value)} rows={2} className="text-sm" />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0 mt-1" onClick={() => removeListItem("terms_conditions", i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </Section>

      {/* 10. Important Notes */}
      <Section title="Important Notes" icon={<AlertTriangle className="h-4 w-4" />}
        badge={`${form.important_notes.filter(n => n.trim()).length} notes`}
        actions={<Button type="button" variant="outline" size="sm" onClick={() => addListItem("important_notes")}><Plus className="h-3 w-3 mr-1" /> Add</Button>}>
        <div className="space-y-2">
          {form.important_notes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Textarea value={item} onChange={(e) => updateListItem("important_notes", i, e.target.value)} rows={2} className="text-sm" />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0 mt-1" onClick={() => removeListItem("important_notes", i)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </Section>

      {/* 11. Bank Details */}
      <Section title="Bank Details" icon={<Building2 className="h-4 w-4" />}>
        <Textarea value={form.bank_details} onChange={(e) => updateField("bank_details", e.target.value)} rows={4} placeholder="Bank name, Account No, IFSC, Branch..." className="text-sm font-mono" />
      </Section>

      {/* 12. PDF Settings - Company Branding */}
      <Section title="PDF Company Branding" icon={<Palette className="h-4 w-4" />}
        badge="Customize PDF header/footer">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">These details appear in the PDF header, footer, and watermark. Changes here only affect the PDF output, not saved data.</p>
          
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Company Logo (for PDF)</Label>
            <div className="flex items-center gap-3">
              {customLogo ? (
                <div className="relative">
                  <img src={customLogo} alt="Logo" className="h-14 w-14 object-contain rounded border bg-background p-1" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 rounded-full" onClick={() => setCustomLogo(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
              <p className="text-xs text-muted-foreground">PNG or JPG recommended. Replaces default NexYatra logo in PDF.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Company Name</Label>
              <Input value={companyInfo.name} onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tagline</Label>
              <Input value={companyInfo.tagline} onChange={(e) => setCompanyInfo(prev => ({ ...prev, tagline: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input value={companyInfo.phone} onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input value={companyInfo.email} onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Website</Label>
              <Input value={companyInfo.website} onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Instagram</Label>
              <Input value={companyInfo.instagram} onChange={(e) => setCompanyInfo(prev => ({ ...prev, instagram: e.target.value }))} className="h-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Full Address</Label>
            <Textarea value={companyInfo.address} onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))} rows={2} className="text-sm" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setCompanyInfo({ ...DEFAULT_COMPANY })}>
            Reset to Default
          </Button>
        </div>
      </Section>

      {/* 13. PDF Section Toggles */}
      <Section title="PDF Section Controls" icon={<Settings2 className="h-4 w-4" />}
        badge="Show/hide PDF sections">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Toggle which sections appear in the generated PDF. This does not affect saved data.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { key: "show_description", label: "Description / Overview" },
              { key: "show_cities", label: "Cities Covered" },
              { key: "show_brief_itinerary", label: "Brief Itinerary" },
              { key: "show_hotel_details", label: "Hotel Details" },
              { key: "show_detailed_itinerary", label: "Detailed Itinerary" },
              { key: "show_inclusions", label: "Inclusions" },
              { key: "show_exclusions", label: "Exclusions" },
              { key: "show_pricing_table", label: "Pricing Table" },
              { key: "show_terms_conditions", label: "Terms & Conditions" },
              { key: "show_important_notes", label: "Important Notes" },
              { key: "show_bank_details", label: "Bank Details" },
              { key: "show_watermark", label: "Logo Watermark" },
              { key: "show_closing_message", label: "Closing Message" },
            ] as { key: keyof PDFSectionToggles; label: string }[]).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                <Label className="text-sm cursor-pointer">{label}</Label>
                <Switch
                  checked={sectionToggles[key]}
                  onCheckedChange={(checked) => setSectionToggles(prev => ({ ...prev, [key]: checked }))}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSectionToggles({ ...DEFAULT_SECTION_TOGGLES })}>
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSectionToggles(
              Object.fromEntries(Object.keys(sectionToggles).map(k => [k, false])) as unknown as PDFSectionToggles
            )}>
              Hide All
            </Button>
          </div>
        </div>
      </Section>

      {/* 14. Closing Message */}
      <Section title="Closing Message" icon={<MessageSquare className="h-4 w-4" />}>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Custom message shown at the bottom of the PDF.</p>
          <Input
            value={closingMessage}
            onChange={(e) => setClosingMessage(e.target.value)}
            placeholder="e.g. Thank you for choosing NexYatra!"
          />
        </div>
      </Section>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-card border rounded-lg p-4 shadow-lg flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {form.client_name ? `${form.client_name} · ${form.destination_name || "No destination"}` : "Fill in client details to get started"}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="secondary" onClick={handleGeneratePDF} disabled={!form.client_name}>
            <FileDown className="h-4 w-4 mr-1" /> Generate PDF
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Quotation"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuotationEditor;
