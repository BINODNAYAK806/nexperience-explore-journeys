
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, Edit, Search } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [editFormData, setEditFormData] = useState({
    remark: "",
    next_call_date: undefined as Date | undefined
  });
  const [remarkCharCount, setRemarkCharCount] = useState(0);
  const [remarkFilter, setRemarkFilter] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(leads);

  const MAX_REMARK_LENGTH = 500;
  
  // Initialize local state with current lead statuses
  useEffect(() => {
    const initialStatuses: Record<string, string> = {};
    leads.forEach(lead => {
      initialStatuses[lead.id] = lead.status;
    });
    setLocalLeadStatus(initialStatuses);
  }, [leads]);

  // Filter leads when remarks filter changes
  useEffect(() => {
    if (remarkFilter.trim() === "") {
      setFilteredLeads(leads);
    } else {
      const filtered = leads.filter(lead => 
        lead.remark?.toLowerCase().includes(remarkFilter.toLowerCase())
      );
      setFilteredLeads(filtered);
    }
  }, [remarkFilter, leads]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Set this lead as currently updating
    setUpdatingStatus(prev => ({ ...prev, [leadId]: true }));
    
    try {
      // Update local state immediately for responsive UI
      setLocalLeadStatus(prev => ({ ...prev, [leadId]: newStatus }));
      
      // Log the update request for debugging
      console.log(`Updating lead ${leadId} status to ${newStatus}`);
      
      // Make the Supabase update request
      const { error } = await supabase
        .from("journey_requests")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log(`Status successfully updated to ${newStatus}`);
      
      toast({
        title: "Status updated",
        description: `Lead status has been updated to ${newStatus}.`,
      });
      
      // Force refresh of parent data
      onDataChange();
    } catch (error) {
      console.error("Error updating status:", error);
      
      // Revert local state on error
      const originalStatus = leads.find(lead => lead.id === leadId)?.status || 'pending';
      setLocalLeadStatus(prev => ({ ...prev, [leadId]: originalStatus }));
      
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

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleEditClick = (lead: Lead) => {
    setCurrentLead(lead);
    setEditFormData({
      remark: lead.remark || "",
      next_call_date: lead.next_call_date ? new Date(lead.next_call_date) : undefined
    });
    setRemarkCharCount(lead.remark?.length || 0);
    setIsEditDialogOpen(true);
  };

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
    if (!currentLead) return;

    // Validate next call date
    if (editFormData.next_call_date && isDateInPast(editFormData.next_call_date)) {
      toast({
        title: "Invalid Date",
        description: "Next call date cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("journey_requests")
        .update({
          remark: editFormData.remark,
          next_call_date: editFormData.next_call_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentLead.id);

      if (error) {
        console.error("Error updating lead:", error);
        throw error;
      }

      toast({
        title: "Update successful",
        description: "Remarks and Next Call Date updated!",
      });
      
      setIsEditDialogOpen(false);
      onDataChange(); // Refresh the table
    } catch (error) {
      console.error("Error updating lead:", error);
      
      toast({
        title: "Update failed",
        description: "Failed to update the lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDateCellClass = (dateString: string | null) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return "text-red-500 font-medium"; // Overdue
    } else {
      return "text-green-500 font-medium"; // Upcoming
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by remarks..."
          value={remarkFilter}
          onChange={(e) => setRemarkFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(lead)}
                      title="Edit Remarks & Next Call Date"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                    <Calendar className="mr-2 h-4 w-4" />
                    {editFormData.next_call_date ? (
                      format(editFormData.next_call_date, "dd/MM/yyyy")
                    ) : (
                      <span className="text-muted-foreground">Select a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsTable;
