import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddLeadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadAdded: () => void;
}

const AddLeadDialog: React.FC<AddLeadDialogProps> = ({ isOpen, onOpenChange, onLeadAdded }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    destination: "",
    contact_number: "",
    travel_date: undefined as Date | undefined,
    status: "pending",
    remark: "",
    next_call_date: undefined as Date | undefined,
  });

  const resetForm = () => {
    setFormData({
      destination: "",
      contact_number: "",
      travel_date: undefined,
      status: "pending",
      remark: "",
      next_call_date: undefined,
    });
  };

  const handleSubmit = async () => {
    if (!formData.destination.trim()) {
      toast({ title: "Destination is required", variant: "destructive" });
      return;
    }
    if (!formData.contact_number.trim()) {
      toast({ title: "Contact number is required", variant: "destructive" });
      return;
    }
    if (!formData.travel_date) {
      toast({ title: "Travel date is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("journey_requests").insert({
        destination: formData.destination.trim(),
        contact_number: formData.contact_number.trim(),
        travel_date: format(formData.travel_date, "yyyy-MM-dd"),
        status: formData.status,
        remark: formData.remark.trim() || null,
        next_call_date: formData.next_call_date ? formData.next_call_date.toISOString() : null,
      });

      if (error) throw error;

      toast({ title: "Lead added successfully" });
      resetForm();
      onOpenChange(false);
      onLeadAdded();
    } catch (error: any) {
      console.error("Error adding lead:", error);
      toast({ title: "Failed to add lead", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              placeholder="e.g. Manali, Goa, Kashmir"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact">Contact Number *</Label>
            <Input
              id="contact"
              placeholder="e.g. 9876543210"
              value={formData.contact_number}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Travel Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.travel_date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.travel_date ? format(formData.travel_date, "dd/MM/yyyy") : "Pick travel date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.travel_date} onSelect={(d) => setFormData(prev => ({ ...prev, travel_date: d }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="talk_done">Talk Done</SelectItem>
                <SelectItem value="deal_final">Deal Final</SelectItem>
                <SelectItem value="quotation_sent">Quotation Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Next Call Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.next_call_date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.next_call_date ? format(formData.next_call_date, "dd/MM/yyyy") : "Pick next call date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.next_call_date} onSelect={(d) => setFormData(prev => ({ ...prev, next_call_date: d }))} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remark">Remarks</Label>
            <Textarea
              id="remark"
              placeholder="Add any notes about this lead..."
              value={formData.remark}
              onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              maxLength={500}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadDialog;
