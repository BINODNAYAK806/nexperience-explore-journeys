import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { generateQuotationPDF } from "./QuotationPDF";
import { format } from "date-fns";

interface QuotationsListProps {
  onEdit: (quotation: any) => void;
  refreshKey?: number;
}

const statusColors: Record<string, string> = {
  draft: "secondary",
  sent: "default",
  accepted: "outline",
};

const QuotationsList: React.FC<QuotationsListProps> = ({ onEdit, refreshKey }) => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = async () => {
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

  useEffect(() => { fetch(); }, [refreshKey]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("quotations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Quotation deleted" });
      fetch();
    }
  };

  const handleDownload = async (q: any) => {
    await generateQuotationPDF({
      client_name: q.client_name,
      client_contact: q.client_contact,
      destination_name: q.destination_name,
      total_price: q.total_price,
      travel_start_date: q.travel_start_date,
      travel_end_date: q.travel_end_date,
      description: q.description || "",
      days: (q.days || []) as any[],
      inclusions: (q.inclusions || []) as string[],
      exclusions: (q.exclusions || []) as string[],
    });
  };

  if (loading) return <p className="text-muted-foreground text-center py-8">Loading quotations...</p>;
  if (quotations.length === 0) return <p className="text-muted-foreground text-center py-8">No quotations yet.</p>;

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotations.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{q.client_name}</TableCell>
              <TableCell>{q.destination_name}</TableCell>
              <TableCell>₹{Number(q.total_price).toLocaleString("en-IN")}</TableCell>
              <TableCell>{q.travel_start_date ? format(new Date(q.travel_start_date), "dd MMM yyyy") : "—"}</TableCell>
              <TableCell><Badge variant={statusColors[q.status] as any || "secondary"}>{q.status}</Badge></TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(q)}><FileDown className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(q)}><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuotationsList;
