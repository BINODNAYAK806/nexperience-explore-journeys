
import { useState } from 'react';
import { Plane, MapPin, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { insertJourneyRequest } from "@/integrations/supabase/client";

export const JourneyRequestForm = () => {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [contactNo, setContactNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStartJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !date || !contactNo) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields before starting your journey.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await insertJourneyRequest({
        destination, 
        travel_date: date.toISOString().split('T')[0], 
        contact_number: contactNo 
      });

      if (error) {
        console.error('Error storing journey data:', error);
        toast({
          title: "Something went wrong",
          description: "Unable to save your journey details. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('Journey data stored successfully:', data);
        toast({
          title: "Journey Initiated!",
          description: "Your travel details have been saved. We'll contact you soon!",
        });
        
        setDestination('');
        setDate(undefined);
        setContactNo('');
      }
    } catch (error) {
      console.error('Exception storing journey data:', error);
      toast({
        title: "Something went wrong",
        description: "Unable to save your journey details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <form onSubmit={handleStartJourney}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent border border-input rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary h-[50px]"
            />
          </div>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-transparent border border-input rounded-lg py-6 pl-10 pr-4 h-[50px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  {date ? format(date, "PP") : <span>When?</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="tel"
              placeholder="Contact Number"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              className="w-full bg-transparent border border-input rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary h-[50px]"
            />
          </div>
          <Button 
            type="submit" 
            className="rounded-lg h-[50px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                <Plane className="mr-2 h-4 w-4" /> Start Journey
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
