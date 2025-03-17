
import React, { useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id: string;
  destination: string;
  travel_date: string;
  created_at: string;
  contact_number: string;
  status: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onDataChange: () => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onDataChange }) => {
  const { toast } = useToast();
  const [localLeadStatus, setLocalLeadStatus] = useState<Record<string, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});

  // Initialize local state with current lead statuses
  React.useEffect(() => {
    const initialStatuses: Record<string, string> = {};
    leads.forEach(lead => {
      initialStatuses[lead.id] = lead.status;
    });
    setLocalLeadStatus(initialStatuses);
  }, [leads]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Set this lead as currently updating
    setUpdatingStatus(prev => ({ ...prev, [leadId]: true }));
    
    try {
      // Update local state immediately for responsive UI
      setLocalLeadStatus(prev => ({ ...prev, [leadId]: newStatus }));
      
      // Log the update request for debugging
      console.log(`Updating lead ${leadId} status to ${newStatus}`);
      
      const { error, data } = await supabase
        .from("journey_requests")
        .update({ status: newStatus })
        .eq("id", leadId)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Update successful, returned data:", data);
      
      toast({
        title: "Status updated",
        description: "The lead status has been successfully updated.",
      });
      
      // Force refresh of parent data
      onDataChange();
    } catch (error) {
      console.error("Error updating status:", error);
      
      // Revert local state on error
      setLocalLeadStatus(prev => ({ 
        ...prev, 
        [leadId]: leads.find(lead => lead.id === leadId)?.status || 'pending'
      }));
      
      toast({
        title: "Update failed",
        description: "Failed to update the lead status. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Mark this lead as no longer updating
      setUpdatingStatus(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Destination</TableHead>
            <TableHead>Travel Date</TableHead>
            <TableHead>Lead Created Date</TableHead>
            <TableHead>Mobile Number</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                No leads found. Try adjusting your filters or add new leads.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.destination}</TableCell>
                <TableCell>{formatDate(lead.travel_date)}</TableCell>
                <TableCell>{formatDate(lead.created_at)}</TableCell>
                <TableCell>{lead.contact_number}</TableCell>
                <TableCell>
                  <Select
                    value={localLeadStatus[lead.id] || lead.status}
                    onValueChange={(value) => handleStatusChange(lead.id, value)}
                    disabled={updatingStatus[lead.id]}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="talk_done">Talk Done</SelectItem>
                      <SelectItem value="deal_final">Deal Final</SelectItem>
                      <SelectItem value="quotation_sent">Quotation Sent</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
