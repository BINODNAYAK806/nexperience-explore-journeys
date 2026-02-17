import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import TemplateForm, { TemplateFormData } from "./TemplateForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Template {
  id: string;
  destination_name: string;
  title: string;
  description: string | null;
  days: any[];
  default_inclusions: string[];
  default_exclusions: string[];
  created_at: string;
}

interface TemplateManagerProps {
  onCreateQuotation: (template: Template) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onCreateQuotation }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("itinerary_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading templates", description: error.message, variant: "destructive" });
    } else {
      setTemplates((data || []) as Template[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSubmit = async (formData: TemplateFormData) => {
    setSaving(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("itinerary_templates")
          .update({
            destination_name: formData.destination_name,
            title: formData.title,
            description: formData.description,
            days: formData.days as any,
            default_inclusions: formData.default_inclusions as any,
            default_exclusions: formData.default_exclusions as any,
          })
          .eq("id", editingTemplate.id);
        if (error) throw error;
        toast({ title: "Template updated" });
      } else {
        const { error } = await supabase
          .from("itinerary_templates")
          .insert({
            destination_name: formData.destination_name,
            title: formData.title,
            description: formData.description,
            days: formData.days as any,
            default_inclusions: formData.default_inclusions as any,
            default_exclusions: formData.default_exclusions as any,
          });
        if (error) throw error;
        toast({ title: "Template created" });
      }
      setShowForm(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error: any) {
      toast({ title: "Error saving template", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("itinerary_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting template", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Template deleted" });
      fetchTemplates();
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">{editingTemplate ? "Edit Template" : "New Master Template"}</h3>
        <TemplateForm
          initialData={editingTemplate ? {
            destination_name: editingTemplate.destination_name,
            title: editingTemplate.title,
            description: editingTemplate.description || "",
            days: editingTemplate.days as any[],
            default_inclusions: editingTemplate.default_inclusions.length ? editingTemplate.default_inclusions : [""],
            default_exclusions: editingTemplate.default_exclusions.length ? editingTemplate.default_exclusions : [""],
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingTemplate(null); }}
          loading={saving}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Master Templates</h3>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> New Template</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading templates...</p>
      ) : templates.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No templates yet. Create your first master template.</p>
      ) : (
        <div className="grid gap-4">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{t.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t.destination_name} · {(t.days as any[]).length} days</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => onCreateQuotation(t)}>
                    <FileText className="h-3 w-3 mr-1" /> Create Quote
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}><Edit className="h-3 w-3" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete template?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{t.title}". This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(t.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
