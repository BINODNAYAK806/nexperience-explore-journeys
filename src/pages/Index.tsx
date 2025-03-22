
import { Link } from 'react-router-dom';
import { 
  Search, ChevronRight, MapPin, Calendar, Phone, 
  Compass, HeartPulse, Award, Coffee, ShieldCheck,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
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
import { supabase } from "@/integrations/supabase/client";

const travelDestinations = [
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    description: "Experience the blend of modern luxury and Arabian heritage.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹75,000",
    rating: 4.8,
    category: "Luxury"
  },
  {
    id: "kerala",
    name: "Kerala",
    country: "India",
    description: "Discover serene backwaters and lush landscapes in God's Own Country.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹35,000",
    rating: 4.7,
    category: "Nature"
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description: "Immerse yourself in tropical paradise with stunning beaches and vibrant culture.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹65,000",
    rating: 4.9,
    category: "Beach"
  },
  {
    id: "manali",
    name: "Manali",
    country: "India",
    description: "Enjoy breathtaking Himalayan views and adventure activities.",
    image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: "₹25,000",
    rating: 4.6,
    category: "Adventure"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    destination: "Dubai",
    text: "My Dubai experience was beyond expectations. The VR preview helped me pre-explore the Burj Khalifa before the trip. The NexYatra team took care of every detail!"
  },
  {
    id: 2,
    name: "Rahul Patel",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    destination: "Kerala",
    text: "The backwaters of Kerala were exactly as shown in the interactive map. I loved how I could customize my itinerary. Perfect for a peaceful retreat from city life."
  },
  {
    id: 3,
    name: "Ananya Joshi",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    destination: "Bali",
    text: "Creating a bucket list on NexYatra and checking off activities in Bali was incredibly satisfying. The dinner with a local chef that they arranged was the highlight of my trip!"
  }
];

const categories = [
  { name: "Adventure", icon: <Compass className="h-6 w-6" /> },
  { name: "Relaxation", icon: <HeartPulse className="h-6 w-6" /> },
  { name: "Luxury", icon: <Award className="h-6 w-6" /> },
  { name: "Cultural", icon: <Coffee className="h-6 w-6" /> }
];

const Index = () => {
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
      // Store data in Supabase
      const { data, error } = await supabase
        .from('journey_requests')
        .insert([
          { 
            destination, 
            travel_date: date.toISOString().split('T')[0], 
            contact_number: contactNo 
          }
        ])
        .select();

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
        
        // Reset form
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
    <div className="opacity-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          >
            <source src="https://mazwai.com/videvo_files/video/free/2019-01/small_watermarked/190111_07_Mauritius_Drone_18_preview.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              Next-level Travel Experiences
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your Perfect <span className="text-primary">Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Immersive, personalized travel experiences tailored to your unique travel personality.
            </p>

            {/* Search Box - Updated with equal sized components */}
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

            {/* Quiz CTA */}
            <div className="mt-8 flex items-center">
              <Link to="/quiz" className="text-white hover:text-primary transition-colors flex items-center group">
                <span className="mr-2">Discover your travel personality</span>
                <span className="bg-white/20 rounded-full p-1 group-hover:bg-primary/20 transition-colors">
                  <ChevronRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-8 h-12 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Travel Categories */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              Tailored Experiences
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore by Travel Style</h2>
            <p className="text-muted-foreground">
              Discover destinations that match your unique travel personality and preferences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div 
                key={category.name}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    Destinations tailored for {category.name.toLowerCase()} seekers.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                Featured Destinations
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Experiences</h2>
              <p className="text-muted-foreground max-w-2xl">
                Immerse yourself in our most sought-after travel experiences, each with unique stories to discover.
              </p>
            </div>
            <Link
              to="/destinations"
              className="mt-4 md:mt-0 inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View all destinations
              <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {travelDestinations.map((destination, index) => (
              <Link
                key={destination.id}
                to={`/destinations/${destination.id}`}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px]">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={destination.image} 
                      alt={destination.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold py-1 px-2 rounded">
                      {destination.category}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{destination.name}</h3>
                        <p className="text-muted-foreground text-sm flex items-center">
                          <MapPin size={14} className="mr-1" /> {destination.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-primary">{destination.price}</div>
                        <div className="text-xs text-muted-foreground">per person</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {destination.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(destination.rating) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs ml-1 text-muted-foreground">
                          {destination.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="inline-flex items-center text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                        Explore <ChevronRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Quiz Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full mb-4">
                Personalized Travel
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Your Travel Personality?</h2>
              <p className="text-white/90 mb-6">
                Take our quick quiz to discover your unique travel personality and get customized recommendations that perfectly match your style and preferences.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Tailored Recommendations</h4>
                    <p className="text-white/80 text-sm">
                      Get destination suggestions that match your unique travel style.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-full mr-4">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Personalized Itineraries</h4>
                    <p className="text-white/80 text-sm">
                      Discover experiences handpicked to match your interests and preferences.
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/quiz">
                <Button variant="secondary" size="lg" className="rounded-full text-primary font-medium">
                  Take the Quiz
                </Button>
              </Link>
            </div>
            <div className="lg:pl-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 shadow-xl">
                <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Are you a...</h3>
                    <p className="text-white/80">Find your travel personality</p>
                  </div>
                  <div className="space-y-4">
                    {["Thrill Seeker", "Cultural Explorer", "Relaxation Enthusiast", "Luxury Connoisseur"].map((type, index) => (
                      <div 
                        key={type}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-colors cursor-pointer"
                      >
                        <label className="flex items-center cursor-pointer">
                          <input type="radio" name="personality" className="sr-only" />
                          <span className="w-5 h-5 rounded-full border-2 border-white mr-3 flex items-center justify-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-white hidden"></span>
                          </span>
                          <span className="font-medium">{type}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-white/80 text-sm mb-4">
                      Complete the full quiz for accurate recommendations
                    </p>
                    <Link to="/quiz">
                      <button className="bg-white text-primary font-medium px-8 py-3 rounded-full hover:shadow-lg transition-all hover:translate-y-[-2px]">
                        Continue to Full Quiz
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              Traveler Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Experiences from Our Travelers</h2>
            <p className="text-muted-foreground">
              Verified reviews from fellow explorers who have experienced the NexYatra difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id}>
                <Card className="h-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={testimonial.avatar} 
                            alt={testimonial.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Traveled to {testimonial.destination}
                        </p>
                      </div>
                    </div>
                    <p className="italic text-muted-foreground">"{testimonial.text}"</p>
                    <div className="mt-4 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i} 
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80')] bg-no-repeat bg-cover opacity-20"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full mb-4">
              Begin Your Journey
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Discover Your Next Adventure?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Start planning your personalized travel experience today and create memories that will last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/destinations">
                <Button variant="secondary" size="lg" className="rounded-full text-primary font-medium w-full sm:w-auto">
                  Explore Destinations
                </Button>
              </Link>
              <Link to="/quiz">
                <Button variant="outline" size="lg" className="rounded-full text-white border-white hover:bg-white/10 w-full sm:w-auto">
                  Take the Travel Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
