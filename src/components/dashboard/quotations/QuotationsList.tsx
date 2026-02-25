import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, FileDown, Search, User, MapPin, IndianRupee, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { generateQuotationPDF } from "./QuotationPDF";
import { format } from "date-fns";

interface QuotationsListProps {
  onEdit: (quotation: any) => void;
  refreshKey?: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; emoji: string }> = {
  draft: { label: "Draft", variant: "secondary", emoji: "📝" },
  sent: { label: "Sent", variant: "default", emoji: "📤" },
  accepted: { label: "Accepted", variant: "outline", emoji: "✅" },
};

const QuotationsList: React.FC<QuotationsListProps> = ({ onEdit, refreshKey }) => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchQuotations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading quotations", description: error.message, variant: "destructive" });
    } else {
      setQuotations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuotations(); }, [refreshKey]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Quotation deleted" });
      fetchQuotations();
    }
  };

  const handleDownload = async (q: any) => {
    await generateQuotationPDF({
      client_name: q.client_name,
      client_contact: q.client_contact,
      destination_name: q.destination_name,
      cities_covered: q.cities_covered,
      total_price: q.total_price,
      price_per_person: q.price_per_person || 0,
      num_persons: q.num_persons || 0,
      person_label: q.person_label || "Adult",
      price_per_child: q.price_per_child || 0,
      num_children: q.num_children || 0,
      child_label: q.child_label || "Child",
      travel_start_date: q.travel_start_date,
      travel_end_date: q.travel_end_date,
      description: q.description || "",
      brief_itinerary: q.brief_itinerary || [],
      hotel_details: q.hotel_details || [],
      days: (q.days || []) as any[],
      inclusions: (q.inclusions || []) as string[],
      exclusions: (q.exclusions || []) as string[],
      terms_conditions: q.terms_conditions || [],
      important_notes: q.important_notes || [],
      bank_details: q.bank_details || "",
    });
  };

  const filtered = quotations.filter(q =>
    q.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.destination_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-muted-foreground text-center py-8">Loading quotations...</p>;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by client name or destination..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-sm">
        <span className="text-muted-foreground">Total: <strong>{quotations.length}</strong></span>
        <span className="text-muted-foreground">Draft: <strong>{quotations.filter(q => q.status === "draft").length}</strong></span>
        <span className="text-muted-foreground">Sent: <strong>{quotations.filter(q => q.status === "sent").length}</strong></span>
        <span className="text-muted-foreground">Accepted: <strong>{quotations.filter(q => q.status === "accepted").length}</strong></span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {quotations.length === 0 ? "No quotations yet. Create your first one!" : "No quotations match your search."}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((q) => {
            const status = statusConfig[q.status] || statusConfig.draft;
            const days = (q.days as any[])?.length || 0;
            const nights = days > 1 ? days - 1 : 0;

            return (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">{q.client_name}</h4>
                        <Badge variant={status.variant} className="text-xs">
                          {status.emoji} {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {q.destination_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" /> {Number(q.total_price).toLocaleString("en-IN")}
                        </span>
                        {q.travel_start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {format(new Date(q.travel_start_date), "dd MMM yyyy")}
                          </span>
                        )}
                        {days > 0 && (
                          <span>{days}D/{nights}N</span>
                        )}
                      </div>
                      {q.client_contact && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> {q.client_contact}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-1 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleDownload(q)} title="Download PDF">
                        <FileDown className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(q)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the quotation for {q.client_name}.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(q.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuotationsList;
