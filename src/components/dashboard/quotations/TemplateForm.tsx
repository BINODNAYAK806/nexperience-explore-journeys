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

export interface TemplateFormData {
  destination_name: string;
  title: string;
  description: string;
  days: DayItem[];
  default_inclusions: string[];
  default_exclusions: string[];
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
  days: [{ day: 1, title: "", description: "" }],
  default_inclusions: [""],
  default_exclusions: [""],
};

const TemplateForm: React.FC<TemplateFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState<TemplateFormData>(initialData || emptyForm);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const updateField = (field: keyof TemplateFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addDay = () => {
    updateField("days", [...form.days, { day: form.days.length + 1, title: "", description: "" }]);
  };

  const removeDay = (index: number) => {
    const updated = form.days.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 }));
    updateField("days", updated);
  };

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

  const updateListItem = (field: "default_inclusions" | "default_exclusions", index: number, value: string) => {
    const updated = [...form[field]];
    updated[index] = value;
    updateField(field, updated);
  };

  const addListItem = (field: "default_inclusions" | "default_exclusions") => {
    updateField(field, [...form[field], ""]);
  };

  const removeListItem = (field: "default_inclusions" | "default_exclusions", index: number) => {
    updateField(field, form[field].filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = {
      ...form,
      default_inclusions: form.default_inclusions.filter((s) => s.trim()),
      default_exclusions: form.default_exclusions.filter((s) => s.trim()),
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Day-by-Day Itinerary</Label>
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

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Template"}</Button>
      </div>
    </form>
  );
};

export default TemplateForm;
