import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, Plus, Trash2, Globe, Tag, FileText } from "lucide-react";

interface SEOEntry {
  id: string;
  page_path: string;
  page_name: string;
  page_type: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots_directive: string | null;
}

export const SEOPageSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingEntry, setEditingEntry] = useState<SEOEntry | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    page_path: "",
    page_name: "",
    page_type: "page",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    canonical_url: "",
    robots_directive: "index, follow",
  });

  const { data: seoEntries, isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("page_path");
      if (error) throw error;
      return data as SEOEntry[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (entry: SEOEntry) => {
      const { error } = await supabase
        .from("seo_settings")
        .update({
          page_name: entry.page_name,
          page_type: entry.page_type,
          meta_title: entry.meta_title,
          meta_description: entry.meta_description,
          meta_keywords: entry.meta_keywords,
          og_image: entry.og_image,
          canonical_url: entry.canonical_url,
          robots_directive: entry.robots_directive,
        })
        .eq("id", entry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      setEditingEntry(null);
      toast({ title: "SEO settings updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      const { error } = await supabase.from("seo_settings").insert(entry);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      setIsAddOpen(false);
      setNewEntry({ page_path: "", page_name: "", page_type: "page", meta_title: "", meta_description: "", meta_keywords: "", og_image: "", canonical_url: "", robots_directive: "index, follow" });
      toast({ title: "Page SEO entry added" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("seo_settings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast({ title: "SEO entry deleted" });
    },
  });

  const getCharColor = (len: number, max: number) => {
    if (len <= max) return "text-green-600";
    return "text-red-600";
  };

  if (isLoading) return <p className="text-muted-foreground py-4">Loading SEO settings...</p>;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{seoEntries?.length || 0} pages configured</p>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Page</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New SEO Entry</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Page Path *</Label>
                <Input placeholder="/destinations/goa" value={newEntry.page_path} onChange={e => setNewEntry(p => ({ ...p, page_path: e.target.value }))} />
              </div>
              <div>
                <Label>Page Name *</Label>
                <Input placeholder="Goa Destination" value={newEntry.page_name} onChange={e => setNewEntry(p => ({ ...p, page_name: e.target.value }))} />
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full border rounded px-3 py-2 text-sm" value={newEntry.page_type} onChange={e => setNewEntry(p => ({ ...p, page_type: e.target.value }))}>
                  <option value="page">Page</option>
                  <option value="category">Category</option>
                  <option value="product">Product/Destination</option>
                </select>
              </div>
              <div>
                <Label>Meta Title <span className={getCharColor(newEntry.meta_title.length, 60)}>({newEntry.meta_title.length}/60)</span></Label>
                <Input maxLength={70} value={newEntry.meta_title} onChange={e => setNewEntry(p => ({ ...p, meta_title: e.target.value }))} />
              </div>
              <div>
                <Label>Meta Description <span className={getCharColor(newEntry.meta_description.length, 160)}>({newEntry.meta_description.length}/160)</span></Label>
                <Textarea maxLength={200} rows={3} value={newEntry.meta_description} onChange={e => setNewEntry(p => ({ ...p, meta_description: e.target.value }))} />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input placeholder="keyword1, keyword2, keyword3" value={newEntry.meta_keywords} onChange={e => setNewEntry(p => ({ ...p, meta_keywords: e.target.value }))} />
              </div>
              <div>
                <Label>Robots Directive</Label>
                <Input placeholder="index, follow" value={newEntry.robots_directive} onChange={e => setNewEntry(p => ({ ...p, robots_directive: e.target.value }))} />
              </div>
              <Button onClick={() => addMutation.mutate(newEntry)} disabled={!newEntry.page_path || !newEntry.page_name}>
                Add Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {seoEntries?.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{entry.page_name}</CardTitle>
                <Badge variant="outline" className="text-xs">{entry.page_type}</Badge>
                <span className="text-xs text-muted-foreground">{entry.page_path}</span>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingEntry({ ...entry })}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(entry.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0 space-y-1">
            <div className="flex items-start gap-2">
              <Tag className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Title ({(entry.meta_title || "").length}/60)</p>
                <p className="text-sm">{entry.meta_title || <span className="text-muted-foreground italic">Not set</span>}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-3 w-3 mt-1 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Description ({(entry.meta_description || "").length}/160)</p>
                <p className="text-sm">{entry.meta_description || <span className="text-muted-foreground italic">Not set</span>}</p>
              </div>
            </div>
            {entry.meta_keywords && (
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.meta_keywords.split(",").map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{kw.trim()}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit SEO - {editingEntry?.page_name}</DialogTitle></DialogHeader>
          {editingEntry && (
            <div className="space-y-3">
              <div>
                <Label>Page Name</Label>
                <Input value={editingEntry.page_name} onChange={e => setEditingEntry(p => p ? { ...p, page_name: e.target.value } : null)} />
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full border rounded px-3 py-2 text-sm" value={editingEntry.page_type} onChange={e => setEditingEntry(p => p ? { ...p, page_type: e.target.value } : null)}>
                  <option value="page">Page</option>
                  <option value="category">Category</option>
                  <option value="product">Product/Destination</option>
                </select>
              </div>
              <div>
                <Label>Meta Title <span className={getCharColor((editingEntry.meta_title || "").length, 60)}>({(editingEntry.meta_title || "").length}/60)</span></Label>
                <Input maxLength={70} value={editingEntry.meta_title || ""} onChange={e => setEditingEntry(p => p ? { ...p, meta_title: e.target.value } : null)} />
              </div>
              <div>
                <Label>Meta Description <span className={getCharColor((editingEntry.meta_description || "").length, 160)}>({(editingEntry.meta_description || "").length}/160)</span></Label>
                <Textarea maxLength={200} rows={3} value={editingEntry.meta_description || ""} onChange={e => setEditingEntry(p => p ? { ...p, meta_description: e.target.value } : null)} />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input value={editingEntry.meta_keywords || ""} onChange={e => setEditingEntry(p => p ? { ...p, meta_keywords: e.target.value } : null)} />
              </div>
              <div>
                <Label>OG Image URL</Label>
                <Input value={editingEntry.og_image || ""} onChange={e => setEditingEntry(p => p ? { ...p, og_image: e.target.value } : null)} />
              </div>
              <div>
                <Label>Canonical URL</Label>
                <Input value={editingEntry.canonical_url || ""} onChange={e => setEditingEntry(p => p ? { ...p, canonical_url: e.target.value } : null)} />
              </div>
              <div>
                <Label>Robots Directive</Label>
                <Input value={editingEntry.robots_directive || ""} onChange={e => setEditingEntry(p => p ? { ...p, robots_directive: e.target.value } : null)} />
              </div>
              <Button onClick={() => editingEntry && updateMutation.mutate(editingEntry)}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
