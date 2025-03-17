
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { LogOutIcon } from "lucide-react";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import LeadsTable, { Lead } from "@/components/dashboard/LeadsTable";
import LeadsChart from "@/components/dashboard/LeadsChart";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchLeads = async () => {
    setLoading(true);
    try {
      console.log("Fetching leads from Supabase...");
      const { data, error } = await supabase
        .from("journey_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        throw error;
      }

      console.log("Fetched lead data:", data);
      setLeads(data as Lead[]);
      setFilteredLeads(data as Lead[]);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Failed to load leads",
        description: "There was an error loading the lead data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [refreshCounter]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin");
  };

  const handleDataChange = () => {
    console.log("Data change detected, refreshing leads...");
    setRefreshCounter(prev => prev + 1);
  };

  const handleFilterApply = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing date range",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    const filtered = leads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      // Set time to start of day for startDate
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      // Set time to end of day for endDate
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      return leadDate >= start && leadDate <= end;
    });

    setFilteredLeads(filtered);
    
    toast({
      title: "Filter applied",
      description: `Showing ${filtered.length} leads in the selected date range.`,
    });
  };

  const handleShowAllLeads = () => {
    setFilteredLeads(leads);
    setStartDate(undefined);
    setEndDate(undefined);
    
    toast({
      title: "Filter cleared",
      description: "Showing all leads.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Travel Leads Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          <LeadsChart leads={filteredLeads} />
          
          <Separator className="my-8" />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Lead Management</h2>
            
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              onFilterApply={handleFilterApply}
              onShowAllLeads={handleShowAllLeads}
            />
            
            {loading ? (
              <div className="flex justify-center py-10">
                <p className="text-muted-foreground">Loading leads...</p>
              </div>
            ) : (
              <LeadsTable leads={filteredLeads} onDataChange={handleDataChange} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
