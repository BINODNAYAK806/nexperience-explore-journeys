import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface DestinationFAQProps {
  destinationName: string;
  price: number;
  duration: string;
  bestTime: string;
  category: string;
}

const DestinationFAQ = ({ 
  destinationName, 
  price, 
  duration, 
  bestTime, 
  category 
}: DestinationFAQProps) => {
  const faqs: FAQItem[] = [
    {
      question: `How much does a ${destinationName} trip cost?`,
      answer: `${destinationName} trip packages from NexYatra start at ₹${price.toLocaleString()} per person. This includes accommodation, transfers, and sightseeing. Prices may vary based on season, hotel category, and customizations.`
    },
    {
      question: `What is the best time to visit ${destinationName}?`,
      answer: `The best time to visit ${destinationName} is ${bestTime}. During this period, you'll experience pleasant weather ideal for sightseeing and outdoor activities.`
    },
    {
      question: `How many days are enough for ${destinationName}?`,
      answer: `We recommend ${duration} to fully explore ${destinationName}. This gives you enough time to visit major attractions, experience local culture, and enjoy ${category.toLowerCase()} activities without rushing.`
    },
    {
      question: `Is ${destinationName} safe for tourists?`,
      answer: `Yes, ${destinationName} is generally safe for tourists. NexYatra ensures all our packages include vetted accommodations, reliable transportation, and 24/7 support during your trip. We recommend standard travel precautions.`
    },
    {
      question: `What to pack for ${destinationName} trip?`,
      answer: `For ${destinationName}, we recommend packing comfortable walking shoes, weather-appropriate clothing for ${bestTime}, sunscreen, a camera, and any personal medications. We'll send you a detailed packing list upon booking.`
    },
    {
      question: `Can I customize my ${destinationName} package?`,
      answer: `Absolutely! All NexYatra packages can be customized according to your preferences. You can add extra days, upgrade hotels, include special activities, or modify the itinerary. Contact us via WhatsApp for personalized quotes.`
    }
  ];

  return (
    <section className="py-8" aria-labelledby="faq-heading">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-6 w-6 text-primary" />
        <h2 id="faq-heading" className="text-2xl font-bold">
          Frequently Asked Questions about {destinationName}
        </h2>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default DestinationFAQ;

// Helper to generate FAQ schema for SEO
export const generateDestinationFAQs = (
  destinationName: string,
  price: number,
  duration: string,
  bestTime: string,
  category: string
) => [
  {
    question: `How much does a ${destinationName} trip cost?`,
    answer: `${destinationName} trip packages from NexYatra start at ₹${price.toLocaleString()} per person. This includes accommodation, transfers, and sightseeing.`
  },
  {
    question: `What is the best time to visit ${destinationName}?`,
    answer: `The best time to visit ${destinationName} is ${bestTime}. During this period, you'll experience pleasant weather ideal for sightseeing.`
  },
  {
    question: `How many days are enough for ${destinationName}?`,
    answer: `We recommend ${duration} to fully explore ${destinationName} and experience local culture.`
  },
  {
    question: `Is ${destinationName} safe for tourists?`,
    answer: `Yes, ${destinationName} is generally safe for tourists. NexYatra ensures vetted accommodations and 24/7 support.`
  },
  {
    question: `Can I customize my ${destinationName} package?`,
    answer: `Absolutely! All NexYatra packages can be customized. Contact us via WhatsApp for personalized quotes.`
  }
];
