import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface DayItem {
  day: number;
  title: string;
  description: string;
}

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

export interface TemplateFormData {
  destination_name: string;
  title: string;
  description: string;
  cities_covered: string[];
  days: DayItem[];
  default_brief_itinerary: BriefItem[];
  default_hotel_details: HotelItem[];
  default_inclusions: string[];
  default_exclusions: string[];
  default_terms_conditions: string[];
  default_important_notes: string[];
}

interface TemplateFormProps {
  initialData?: TemplateFormData;
  onSubmit: (data: TemplateFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const emptyForm: TemplateFormData = {
  destination_name: "",
  title: "",
  description: "",
  cities_covered: [""],
  days: [{ day: 1, title: "", description: "" }],
  default_brief_itinerary: [{ day: 1, description: "" }],
  default_hotel_details: [{ city: "", hotel_name: "", room_type: "", nights: 1 }],
  default_inclusions: [""],
  default_exclusions: [""],
  default_terms_conditions: [
    "The tour is Private Tours, means there is no other participant, just only you and your companions.",
    "Time and Tourism site is subject to change based on your request.",
    "The price already includes applicable Government taxes and Services.",
    "Use the contact form provided to send us a message, ask for information or make a tour booking request.",
  ],
  default_important_notes: [""],
};

const TemplateForm: React.FC<TemplateFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<TemplateFormData>(initialData || emptyForm);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const updateField = (field: keyof TemplateFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Day helpers
  const addDay = () => updateField("days", [...form.days, { day: form.days.length + 1, title: "", description: "" }]);
  const removeDay = (index: number) => updateField("days", form.days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  const moveDay = (index: number, direction: "up" | "down") => {
    const arr = [...form.days];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    updateField("days", arr.map((d, i) => ({ ...d, day: i + 1 })));
  };
  const updateDay = (index: number, field: "title" | "description", value: string) => {
    const updated = [...form.days];
    updated[index] = { ...updated[index], [field]: value };
    updateField("days", updated);
  };

  // Brief itinerary helpers
  const addBrief = () => updateField("default_brief_itinerary", [...form.default_brief_itinerary, { day: form.default_brief_itinerary.length + 1, description: "" }]);
  const removeBrief = (i: number) => updateField("default_brief_itinerary", form.default_brief_itinerary.filter((_, idx) => idx !== i).map((b, idx) => ({ ...b, day: idx + 1 })));
  const updateBrief = (i: number, value: string) => {
    const updated = [...form.default_brief_itinerary];
    updated[i] = { ...updated[i], description: value };
    updateField("default_brief_itinerary", updated);
  };

  // Hotel helpers
  const addHotel = () => updateField("default_hotel_details", [...form.default_hotel_details, { city: "", hotel_name: "", room_type: "", nights: 1 }]);
  const removeHotel = (i: number) => updateField("default_hotel_details", form.default_hotel_details.filter((_, idx) => idx !== i));
  const updateHotel = (i: number, field: keyof HotelItem, value: any) => {
    const updated = [...form.default_hotel_details];
    updated[i] = { ...updated[i], [field]: value };
    updateField("default_hotel_details", updated);
  };

  // Cities helpers
  const addCity = () => updateField("cities_covered", [...form.cities_covered, ""]);
  const removeCity = (i: number) => updateField("cities_covered", form.cities_covered.filter((_, idx) => idx !== i));
  const updateCity = (i: number, value: string) => {
    const updated = [...form.cities_covered];
    updated[i] = value;
    updateField("cities_covered", updated);
  };

  // Generic list helpers
  const updateListItem = (field: "default_inclusions" | "default_exclusions" | "default_terms_conditions" | "default_important_notes", index: number, value: string) => {
    const updated = [...form[field]];
    updated[index] = value;
    updateField(field, updated);
  };
  const addListItem = (field: "default_inclusions" | "default_exclusions" | "default_terms_conditions" | "default_important_notes") => updateField(field, [...form[field], ""]);
  const removeListItem = (field: "default_inclusions" | "default_exclusions" | "default_terms_conditions" | "default_important_notes", index: number) => updateField(field, form[field].filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = {
      ...form,
      cities_covered: form.cities_covered.filter((s) => s.trim()),
      default_inclusions: form.default_inclusions.filter((s) => s.trim()),
      default_exclusions: form.default_exclusions.filter((s) => s.trim()),
      default_terms_conditions: form.default_terms_conditions.filter((s) => s.trim()),
      default_important_notes: form.default_important_notes.filter((s) => s.trim()),
    };
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Destination Name</Label>
          <Input value={form.destination_name} onChange={(e) => updateField("destination_name", e.target.value)} required />
        </div>
        <div>
          <Label>Template Title</Label>
          <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} required />
        </div>
      </div>

      <div>
        <Label>Description / Overview</Label>
        <Textarea value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Use {{CLIENT_NAME}}, {{START_DATE}}, {{TOTAL_PRICE}} as placeholders..." rows={3} />
      </div>

      {/* Cities Covered */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Cities Covered</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCity}><Plus className="h-4 w-4 mr-1" /> Add City</Button>
        </div>
        <div className="space-y-2">
          {form.cities_covered.map((city, i) => (
            <div key={i} className="flex gap-2">
              <Input value={city} onChange={(e) => updateCity(i, e.target.value)} placeholder="e.g. Srinagar" />
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeCity(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Brief Itinerary */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Brief Itinerary</Label>
          <Button type="button" variant="outline" size="sm" onClick={addBrief}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {form.default_brief_itinerary.map((b, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-sm font-medium w-14 shrink-0">Day {b.day}</span>
              <Input value={b.description} onChange={(e) => updateBrief(i, e.target.value)} placeholder="e.g. Arrival in Srinagar, transfer to hotel" />
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeBrief(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Hotel Details */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Hotel Details</Label>
          <Button type="button" variant="outline" size="sm" onClick={addHotel}><Plus className="h-4 w-4 mr-1" /> Add Hotel</Button>
        </div>
        <div className="space-y-3">
          {form.default_hotel_details.map((h, i) => (
            <Card key={i}>
              <CardContent className="py-3 px-4 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div><Label className="text-xs">City</Label><Input value={h.city} onChange={(e) => updateHotel(i, "city", e.target.value)} placeholder="City" /></div>
                <div><Label className="text-xs">Hotel Name</Label><Input value={h.hotel_name} onChange={(e) => updateHotel(i, "hotel_name", e.target.value)} placeholder="Hotel name" /></div>
                <div><Label className="text-xs">Room Type</Label><Input value={h.room_type} onChange={(e) => updateHotel(i, "room_type", e.target.value)} placeholder="Deluxe/Premium" /></div>
                <div className="flex gap-2">
                  <div className="flex-1"><Label className="text-xs">Nights</Label><Input type="number" value={h.nights} onChange={(e) => updateHotel(i, "nights", Number(e.target.value))} /></div>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive mt-5" onClick={() => removeHotel(i)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Day-by-Day Itinerary */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Day-by-Day Detailed Itinerary</Label>
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

      {/* Inclusions & Exclusions */}
      {(["default_inclusions", "default_exclusions"] as const).map((field) => (
        <div key={field}>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-base font-semibold">{field === "default_inclusions" ? "Inclusions" : "Exclusions"}</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => addListItem(field)}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
          <div className="space-y-2">
            {form[field].map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input value={item} onChange={(e) => updateListItem(field, i, e.target.value)} placeholder={field === "default_inclusions" ? "e.g. Hotel accommodation" : "e.g. Airfare"} />
                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeListItem(field, i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Terms & Conditions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Terms & Conditions</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addListItem("default_terms_conditions")}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {form.default_terms_conditions.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Textarea value={item} onChange={(e) => updateListItem("default_terms_conditions", i, e.target.value)} rows={2} />
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeListItem("default_terms_conditions", i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Important Notes</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => addListItem("default_important_notes")}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {form.default_important_notes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Textarea value={item} onChange={(e) => updateListItem("default_important_notes", i, e.target.value)} rows={2} />
              <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeListItem("default_important_notes", i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Template"}</Button>
      </div>
    </form>
  );
};

export default TemplateForm;
