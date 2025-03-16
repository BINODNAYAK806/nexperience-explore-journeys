
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  onFilterApply: () => void;
  onShowAllLeads: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onFilterApply,
  onShowAllLeads,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-end">
      <div className="space-y-1">
        <label className="text-sm font-medium">Start Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "dd/MM/yyyy") : "Pick start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">End Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "dd/MM/yyyy") : "Pick end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onFilterApply} 
          disabled={!startDate || !endDate}
        >
          Apply Filter
        </Button>
        <Button 
          variant="outline" 
          onClick={onShowAllLeads}
        >
          Show All Leads
        </Button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
