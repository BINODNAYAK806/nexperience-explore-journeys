
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import LeadsTableFilters from "./table/LeadsTableFilters";
import LeadEditDialog from "./table/LeadEditDialog";
import LeadDeleteDialog from "./table/LeadDeleteDialog";

export interface Lead {
  id: string;
  destination: string;
  travel_date: string;
  created_at: string;
  contact_number: string;
  status: string;
  remark: string | null;
  next_call_date: string | null;
}

interface LeadsTableProps {
  leads: Lead[];
  onDataChange: () => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onDataChange }) => {
  const { toast } = useToast();
  const [localLeadStatus, setLocalLeadStatus] = useState<Record<string, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [remarkFilter, setRemarkFilter] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads);
  const [nextCallDateStart, setNextCallDateStart] = useState<Date | undefined>(undefined);
  const [nextCallDateEnd, setNextCallDateEnd] = useState<Date | undefined>(undefined);
  const [isNextCallDateFilterOpen, setIsNextCallDateFilterOpen] = useState(false);
  const [mobileFilter, setMobileFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  
  // Update local state when leads prop changes
  useEffect(() => {
    console.log("Leads in LeadsTable:", leads);
    setFilteredLeads(leads);
    
    const initialStatuses: Record<string, string> = {};
    leads.forEach(lead => {
      initialStatuses[lead.id] = lead.status;
    });
    setLocalLeadStatus(initialStatuses);
  }, [leads]);

  useEffect(() => {
    let filtered = leads;
    
    if (remarkFilter.trim() !== "") {
      filtered = filtered.filter(lead => 
        lead.remark?.toLowerCase().includes(remarkFilter.toLowerCase())
      );
    }
    
    if (mobileFilter.trim() !== "") {
      filtered = filtered.filter(lead => 
        lead.contact_number.includes(mobileFilter.trim())
      );
    }
    
    if (destinationFilter.trim() !== "") {
      filtered = filtered.filter(lead => 
        lead.destination.toLowerCase().includes(destinationFilter.toLowerCase())
      );
    }
    
    if (nextCallDateStart && nextCallDateEnd) {
      const startDate = new Date(nextCallDateStart);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(nextCallDateEnd);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(lead => {
        if (!lead.next_call_date) return false;
        const callDate = new Date(lead.next_call_date);
        return callDate >= startDate && callDate <= endDate;
      });
    }
    
    setFilteredLeads(filtered);
  }, [remarkFilter, mobileFilter, destinationFilter, nextCallDateStart, nextCallDateEnd, leads]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(prev => ({ ...prev, [leadId]: true }));
    
    try {
      setLocalLeadStatus(prev => ({ ...prev, [leadId]: newStatus }));
      
      const { error } = await supabase
        .from("journey_requests")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Lead status has been updated to ${newStatus}.`,
      });
      
      onDataChange();
    } catch (error) {
      console.error("Error updating status:", error);
      
      const originalStatus = leads.find(lead => lead.id === leadId)?.status || 'pending';
      setLocalLeadStatus(prev => ({ ...prev, [leadId]: originalStatus }));
      
      toast({
        title: "Update failed",
        description: "Failed to update the lead status. Please try again.",
        variant: "destructive",
      });
    } finally {
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

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getDateCellClass = (dateString: string | null) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date < today ? "text-red-500 font-medium" : "text-green-500 font-medium";
  };

  return (
    <div className="space-y-4">
      <LeadsTableFilters
        remarkFilter={remarkFilter}
        setRemarkFilter={setRemarkFilter}
        nextCallDateStart={nextCallDateStart}
        nextCallDateEnd={nextCallDateEnd}
        setNextCallDateStart={setNextCallDateStart}
        setNextCallDateEnd={setNextCallDateEnd}
        isNextCallDateFilterOpen={isNextCallDateFilterOpen}
        setIsNextCallDateFilterOpen={setIsNextCallDateFilterOpen}
        mobileFilter={mobileFilter}
        setMobileFilter={setMobileFilter}
        destinationFilter={destinationFilter}
        setDestinationFilter={setDestinationFilter}
      />
      
      {nextCallDateStart && nextCallDateEnd && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Next Call Date Filter: {nextCallDateStart.toLocaleDateString()} - {nextCallDateEnd.toLocaleDateString()}
          </span>
        </div>
      )}
      
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destination</TableHead>
              <TableHead>Travel Date</TableHead>
              <TableHead>Lead Created Date</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Next Call Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No leads found. Try adjusting your filters or add new leads.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.destination}</TableCell>
                  <TableCell>{formatDate(lead.travel_date)}</TableCell>
                  <TableCell>{formatDate(lead.created_at)}</TableCell>
                  <TableCell>{lead.contact_number}</TableCell>
                  <TableCell>
                    {lead.remark ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="link" className="p-0 h-auto">
                            {truncateText(lead.remark, 30)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                          <p className="text-sm">{lead.remark}</p>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-muted-foreground text-sm">No remarks</span>
                    )}
                  </TableCell>
                  <TableCell className={getDateCellClass(lead.next_call_date)}>
                    {lead.next_call_date ? formatDate(lead.next_call_date) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
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
                      {updatingStatus[lead.id] && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setCurrentLead(lead);
                          setIsEditDialogOpen(true);
                        }}
                        title="Edit Remarks & Next Call Date"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setCurrentLead(lead);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-destructive hover:text-destructive"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LeadEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        lead={currentLead}
        onLeadUpdate={onDataChange}
      />

      <LeadDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        lead={currentLead}
        onLeadDelete={onDataChange}
      />
    </div>
  );
};

export default LeadsTable;
