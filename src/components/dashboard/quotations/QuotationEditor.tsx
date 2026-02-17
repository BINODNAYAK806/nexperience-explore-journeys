import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, FileDown } from "lucide-react";
import { generateQuotationPDF } from "./QuotationPDF";
import { format } from "date-fns";

interface DayItem {
  day: number;
  title: string;
  description: string;
}

export interface QuotationData {
  id?: string;
  template_id?: string | null;
  client_name: string;
  client_contact: string;
  destination_name: string;
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
  days: DayItem[];
  inclusions: string[];
  exclusions: string[];
  terms_conditions: string[];
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

const emptyQuotation: QuotationData = {
  client_name: "",
  client_contact: "",
  destination_name: "",
  total_price: 0,
  price_per_person: 0,
  num_persons: 2,
  person_label: "Adult",
  price_per_child: 0,
  num_children: 0,
  child_label: "Child",
  travel_start_date: "",
  travel_end_date: "",
  description: "",
  days: [{ day: 1, title: "", description: "" }],
  inclusions: [""],
  exclusions: [""],
  terms_conditions: [...DEFAULT_TERMS],
  status: "draft",
};

const QuotationEditor: React.FC<QuotationEditorProps> = ({ initialData, preloadTemplate, onSaved, onCancel }) => {
  const [form, setForm] = useState<QuotationData>(initialData || emptyQuotation);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("itinerary_templates").select("*").order("title").then(({ data }) => {
      setTemplates((data || []) as any[]);
    });
  }, []);

  useEffect(() => {
    if (preloadTemplate) {
      loadTemplate(preloadTemplate);
    }
  }, [preloadTemplate]);

  const recalcTotal = (pp: number, np: number, pc: number, nc: number) => {
    return pp * np + pc * nc;
  };

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
      days: JSON.parse(JSON.stringify(template.days || [])),
      inclusions: template.default_inclusions?.length ? [...template.default_inclusions] : [""],
      exclusions: template.default_exclusions?.length ? [...template.default_exclusions] : [""],
    }));
  };

  const updateField = (field: keyof QuotationData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePricing = (field: string, value: number) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      next.total_price = recalcTotal(next.price_per_person, next.num_persons, next.price_per_child, next.num_children);
      return next;
    });
  };

  const addDay = () => updateField("days", [...form.days, { day: form.days.length + 1, title: "", description: "" }]);

  const removeDay = (i: number) => {
    updateField("days", form.days.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  };

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

  const updateListItem = (field: "inclusions" | "exclusions" | "terms_conditions", i: number, value: string) => {
    const updated = [...form[field]];
    updated[i] = value;
    updateField(field, updated);
  };

  const addListItem = (field: "inclusions" | "exclusions" | "terms_conditions") => updateField(field, [...form[field], ""]);

  const removeListItem = (field: "inclusions" | "exclusions" | "terms_conditions", i: number) => {
    updateField(field, form[field].filter((_, idx) => idx !== i));
  };

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
        days: form.days.map((d) => ({ ...d, title: injectVariables(d.title), description: injectVariables(d.description) })) as unknown as import("@/integrations/supabase/types").Json,
        inclusions: form.inclusions.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        exclusions: form.exclusions.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        terms_conditions: form.terms_conditions.filter((s) => s.trim()) as unknown as import("@/integrations/supabase/types").Json,
        status: form.status,
      };

      if (form.id) {
        const { error } = await supabase.from("quotations").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("quotations").insert(payload);
        if (error) throw error;
      }
      toast({ title: "Quotation saved" });
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
    };
    await generateQuotationPDF(injected);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{form.id ? "Edit Quotation" : "New Quotation"}</h3>
        <Button variant="outline" onClick={onCancel}>Back</Button>
      </div>

      {!initialData && !preloadTemplate && (
        <div>
          <Label>Load from Template</Label>
          <Select onValueChange={(id) => {
            const t = templates.find((t) => t.id === id);
            if (t) loadTemplate(t);
          }}>
            <SelectTrigger><SelectValue placeholder="Select a template..." /></SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.title} — {t.destination_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Client & Trip Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><Label>Client Name *</Label><Input value={form.client_name} onChange={(e) => updateField("client_name", e.target.value)} /></div>
          <div><Label>Client Contact</Label><Input value={form.client_contact} onChange={(e) => updateField("client_contact", e.target.value)} /></div>
          <div><Label>Destination *</Label><Input value={form.destination_name} onChange={(e) => updateField("destination_name", e.target.value)} /></div>
          <div><Label>Start Date *</Label><Input type="date" value={form.travel_start_date} onChange={(e) => updateField("travel_start_date", e.target.value)} /></div>
          <div><Label>End Date</Label><Input type="date" value={form.travel_end_date} onChange={(e) => updateField("travel_end_date", e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Adult Pricing</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Price Per Adult (Rs.)</Label><Input type="number" value={form.price_per_person} onChange={(e) => updatePricing("price_per_person", Number(e.target.value))} /></div>
          <div><Label>No. of Adults</Label><Input type="number" value={form.num_persons} onChange={(e) => updatePricing("num_persons", Number(e.target.value))} /></div>
          <div><Label>Label</Label><Input value={form.person_label} onChange={(e) => updateField("person_label", e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Child Pricing</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><Label>Price Per Child (Rs.)</Label><Input type="number" value={form.price_per_child} onChange={(e) => updatePricing("price_per_child", Number(e.target.value))} /></div>
          <div><Label>No. of Children</Label><Input type="number" value={form.num_children} onChange={(e) => updatePricing("num_children", Number(e.target.value))} /></div>
          <div><Label>Label</Label><Input value={form.child_label} onChange={(e) => updateField("child_label", e.target.value)} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Total Price (Rs.)</Label>
            <Input type="number" value={form.total_price} readOnly className="bg-muted max-w-[200px] font-bold text-lg" />
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>Overview / Description</Label>
        <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Itinerary</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDay}><Plus className="h-4 w-4 mr-1" /> Add Day</Button>
        </div>
        <div className="space-y-3">
          {form.days.map((day, i) => (
            <Card key={i}>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Day {day.day}</CardTitle>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDay(i, "up")} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveDay(i, "down")} disabled={i === form.days.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeDay(i)} disabled={form.days.length <= 1}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0 space-y-2">
                <Input placeholder="Day title" value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} />
                <Textarea placeholder="Day description" value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} rows={2} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(["inclusions", "exclusions"] as const).map((field) => (
        <div key={field}>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold capitalize">{field}</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem(field)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
          <div className="space-y-2">
            {form[field].map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input value={item} onChange={(e) => updateListItem(field, i, e.target.value)} />
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeListItem(field, i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Terms & Conditions</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addListItem("terms_conditions")}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {form.terms_conditions.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Textarea value={item} onChange={(e) => updateListItem("terms_conditions", i, e.target.value)} rows={2} />
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeListItem("terms_conditions", i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="secondary" onClick={handleGeneratePDF} disabled={!form.client_name}><FileDown className="h-4 w-4 mr-1" /> Generate PDF</Button>
        <Button onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save Draft"}</Button>
      </div>
    </div>
  );
};

export default QuotationEditor;
