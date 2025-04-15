
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadsTableFiltersProps {
  remarkFilter: string;
  setRemarkFilter: (value: string) => void;
  nextCallDateStart: Date | undefined;
  nextCallDateEnd: Date | undefined;
  setNextCallDateStart: (date: Date | undefined) => void;
  setNextCallDateEnd: (date: Date | undefined) => void;
  isNextCallDateFilterOpen: boolean;
  setIsNextCallDateFilterOpen: (value: boolean) => void;
}

const LeadsTableFilters: React.FC<LeadsTableFiltersProps> = ({
  remarkFilter,
  setRemarkFilter,
  nextCallDateStart,
  nextCallDateEnd,
  setNextCallDateStart,
  setNextCallDateEnd,
  isNextCallDateFilterOpen,
  setIsNextCallDateFilterOpen,
}) => {
  const { toast } = useToast();

  const applyNextCallDateFilter = () => {
    if (!nextCallDateStart || !nextCallDateEnd) {
      toast({
        title: "Missing date range",
        description: "Please select both start and end dates for the next call date filter.",
        variant: "destructive",
      });
      return;
    }
    
    setIsNextCallDateFilterOpen(false);
    
    toast({
      title: "Filter applied",
      description: "Showing leads with next call dates in the selected range.",
    });
  };

  const clearNextCallDateFilter = () => {
    setNextCallDateStart(undefined);
    setNextCallDateEnd(undefined);
    
    toast({
      description: "Next call date filter cleared.",
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by remarks..."
          value={remarkFilter}
          onChange={(e) => setRemarkFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Popover open={isNextCallDateFilterOpen} onOpenChange={setIsNextCallDateFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Filter Next Call Date</span>
              {nextCallDateStart && nextCallDateEnd && (
                <Badge variant="secondary" className="ml-1">
                  Active
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="space-y-4 p-4">
              <h4 className="text-sm font-medium">Next Call Date Range</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <div className="flex flex-col items-start gap-2">
                    <Calendar
                      mode="single"
                      selected={nextCallDateStart}
                      onSelect={setNextCallDateStart}
                      initialFocus
                      className="border rounded-md"
                    />
                    {nextCallDateStart && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setNextCallDateStart(undefined)}
                        className="mt-1"
                      >
                        <X className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">End Date</p>
                  <div className="flex flex-col items-start gap-2">
                    <Calendar
                      mode="single"
                      selected={nextCallDateEnd}
                      onSelect={setNextCallDateEnd}
                      initialFocus
                      className="border rounded-md"
                    />
                    {nextCallDateEnd && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setNextCallDateEnd(undefined)}
                        className="mt-1"
                      >
                        <X className="h-4 w-4 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={clearNextCallDateFilter}>
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  onClick={applyNextCallDateFilter}
                  disabled={!nextCallDateStart || !nextCallDateEnd}
                >
                  Apply Filter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {nextCallDateStart && nextCallDateEnd && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={clearNextCallDateFilter}
            title="Clear next call date filter"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeadsTableFilters;
