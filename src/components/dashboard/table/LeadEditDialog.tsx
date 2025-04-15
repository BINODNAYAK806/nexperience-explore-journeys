
import React, { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "../LeadsTable";

interface LeadEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onLeadUpdate: () => void;
}

const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
  isOpen,
  onOpenChange,
  lead,
  onLeadUpdate,
}) => {
  const { toast } = useToast();
  const [editFormData, setEditFormData] = useState({
    remark: lead?.remark || "",
    next_call_date: lead?.next_call_date ? new Date(lead.next_call_date) : undefined,
  });
  const [remarkCharCount, setRemarkCharCount] = useState(lead?.remark?.length || 0);
  
  const MAX_REMARK_LENGTH = 500;

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_REMARK_LENGTH) {
      setEditFormData(prev => ({ ...prev, remark: value }));
      setRemarkCharCount(value.length);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setEditFormData(prev => ({ ...prev, next_call_date: date }));
  };

  const isDateInPast = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSaveChanges = async () => {
    if (!lead) return;

    if (editFormData.next_call_date && isDateInPast(editFormData.next_call_date)) {
      toast({
        title: "Invalid Date",
        description: "Next call date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    try {
      const next_call_date = editFormData.next_call_date 
        ? editFormData.next_call_date.toISOString() 
        : null;
      
      const { error } = await supabase
        .from("journey_requests")
        .update({
          remark: editFormData.remark,
          next_call_date: next_call_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", lead.id);

      if (error) throw error;

      toast({
        title: "Update successful",
        description: "Remarks and Next Call Date updated!",
      });
      
      onOpenChange(false);
      onLeadUpdate();
    } catch (error) {
      console.error("Error updating lead:", error);
      
      toast({
        title: "Update failed",
        description: "Failed to update the lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Lead Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="remark" className="text-sm font-medium">
              Customer Remarks
            </label>
            <Textarea 
              id="remark" 
              placeholder="Add notes from the last interaction..."
              value={editFormData.remark}
              onChange={handleRemarkChange}
              className="resize-none min-h-[100px]"
            />
            <div className={`text-xs flex justify-end ${remarkCharCount > MAX_REMARK_LENGTH * 0.9 ? 'text-orange-500' : 'text-muted-foreground'}`}>
              {remarkCharCount}/{MAX_REMARK_LENGTH}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Next Follow-Up Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editFormData.next_call_date ? (
                    format(editFormData.next_call_date, "dd/MM/yyyy")
                  ) : (
                    <span className="text-muted-foreground">Select a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editFormData.next_call_date}
                  onSelect={handleDateChange}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Select a future date for the next call</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEditDialog;
