
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "../LeadsTable";
import { Loader2 } from "lucide-react";

interface LeadDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onLeadDelete: () => void;
}

const LeadDeleteDialog: React.FC<LeadDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  lead,
  onLeadDelete,
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!lead) return;
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting lead with ID:", lead.id);
      
      const { error } = await supabase
        .from("journey_requests")
        .delete()
        .eq("id", lead.id);

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      toast({
        title: "Lead deleted",
        description: "The lead has been successfully deleted.",
      });
      
      onLeadDelete();
    } catch (error) {
      console.error("Error deleting lead:", error);
      
      toast({
        title: "Delete failed",
        description: "Failed to delete the lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the lead for{' '}
            <span className="font-medium">
              {lead?.destination}
            </span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LeadDeleteDialog;
