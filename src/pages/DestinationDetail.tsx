import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Clock, Calendar, Users, 
  Heart, Share2, BookOpen, Tag, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SEO, { getDestinationSchema, getBreadcrumbSchema } from '@/components/SEO';

const DestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const cleanSlug = id?.replace(/-+$/, '') || '';

  // Scroll to top when destination changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [cleanSlug]);

  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', cleanSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('slug', cleanSlug)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: relatedDestinations = [] } = useQuery({
    queryKey: ['related-destinations', destination?.category],
    enabled: !!destination?.category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('category', destination.category)
        .neq('id', destination.id)
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-[400px] w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-6">Destination Not Found</h1>
        <p className="mb-6">Sorry, we couldn't find the destination you're looking for.</p>
        <Link to="/destinations">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
          </Button>
        </Link>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      getDestinationSchema({
        name: destination.name,
        description: destination.description,
        price: destination.price || 0,
        image_url: destination.image_url || '',
        country: destination.country || '',
        rating: destination.rating || 4.5,
        duration: destination.duration || '5 Days',
        slug: cleanSlug
      }),
      getBreadcrumbSchema([
        { name: "Home", url: "https://nexperience-explore-journeys.lovable.app/" },
        { name: "Destinations", url: "https://nexperience-explore-journeys.lovable.app/destinations" },
        { name: destination.name, url: `https://nexperience-explore-journeys.lovable.app/destinations/${cleanSlug}` }
      ])
    ]
  };

  return (
    <div>
      <SEO 
        title={`${destination.name} Tour Package - ₹${destination.price?.toLocaleString()} | NexYatra`}
        description={`Book ${destination.name} tour package starting ₹${destination.price?.toLocaleString()}. ${destination.description?.slice(0, 120)}... Best prices & customized itineraries.`}
        keywords={`${destination.name} tour, ${destination.name} package, ${destination.country} travel, ${destination.name} holiday, ${destination.category} vacation, affordable ${destination.name} trip`}
        image={destination.image_url || '/og-image.png'}
        type="product"
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src={destination.image_url || '/placeholder.svg'} 
          alt={destination.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="container-custom pb-12">
            <div className="max-w-2xl">
              <Badge className="mb-4">{destination.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{destination.name}</h1>
              <p className="text-white/90 flex items-center text-lg">
                <MapPin className="mr-1" size={16} /> {destination.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center mb-6 gap-4">
              <Link to="/destinations">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Destinations
                </Button>
              </Link>
              <div className="flex items-center ml-auto">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center bg-muted/50 rounded-full px-3 py-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                <span>{destination.rating} rating</span>
              </div>
              <div className="flex items-center bg-muted/50 rounded-full px-3 py-1 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                <span>{destination.duration}</span>
              </div>
              <div className="flex items-center bg-muted/50 rounded-full px-3 py-1 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Best time: {destination.best_time}</span>
              </div>
              <div className="flex items-center bg-muted/50 rounded-full px-3 py-1 text-sm">
                <Users className="h-4 w-4 mr-1" />
                <span>{destination.bookings}+ travelers</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <p className="text-muted-foreground mb-8">{destination.description}</p>

            <Tabs defaultValue="highlights" className="mb-8">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
                <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              </TabsList>
              <TabsContent value="highlights" className="space-y-4">
                <ul className="space-y-2">
                  {(() => {
                    const highlightsData = destination.highlights;
                    if (!highlightsData) return null;
                    
                    let highlightsArray: string[] = [];
                    
                    // Handle different formats
                    if (Array.isArray(highlightsData)) {
                      highlightsArray = highlightsData;
                    } else if (typeof highlightsData === 'string') {
                      try {
                        // Try to parse as JSON array
                        const parsed = JSON.parse(highlightsData);
                        if (Array.isArray(parsed)) {
                          highlightsArray = parsed;
                        } else {
                          highlightsArray = highlightsData.split('\n').filter(Boolean);
                        }
                      } catch {
                        // Fallback to string splitting
                        highlightsArray = highlightsData.split('\n').filter(Boolean);
                      }
                    }
                    
                    return highlightsArray.map((highlight: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 mr-2">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        {highlight}
                      </li>
                    ));
                  })()}
                </ul>
              </TabsContent>
              <TabsContent value="inclusions" className="space-y-4">
                <ul className="space-y-2">
                  {(destination.inclusions as string[] || []).map((inclusion: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 mr-2">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      {inclusion}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="itinerary" className="space-y-4">
                <p className="text-muted-foreground mb-2">
                  Detailed day-by-day itinerary will be provided upon booking confirmation.
                </p>
                <Button variant="outline" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" /> Download Sample Itinerary
                </Button>
              </TabsContent>
            </Tabs>

            <h2 className="text-2xl font-bold mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(destination.gallery as string[] || []).map((image: string, index: number) => (
                <div key={index} className="rounded-lg overflow-hidden h-48">
                  <img 
                    src={image} 
                    alt={`${destination.name} ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-4">Activities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(destination.activities as string[] || []).map((activity: string, index: number) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{activity}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-80 lg:w-96">
            <div className="sticky top-24">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1">
                    ₹{destination.price?.toLocaleString()}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">per person on twin sharing</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-medium">₹{destination.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">₹{destination.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Link to={`/checkout/${cleanSlug}`} className="w-full">
                    <Button className="w-full mb-3">Book Now</Button>
                  </Link>
                  <Button variant="outline" className="w-full mb-3">Customize Package</Button>
                  <Button 
                    variant="secondary" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => {
                      const message = `Hi! I'm interested in the ${destination.name} package. Could you please provide more details?`;
                      const whatsappUrl = `https://wa.me/918347015725?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Us
                  </Button>
                  
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>No booking fees • Free cancellation</p>
                  </div>
                </div>
              </Card>
              
              <div className="mt-6">
                <h3 className="font-bold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our travel experts are here to assist you
                </p>
                <Button variant="outline" className="w-full">
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Destinations */}
      {relatedDestinations.length > 0 && (
        <div className="bg-muted/30">
          <div className="container-custom py-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDestinations.map((relatedDest) => (
                <Link 
                  key={relatedDest.id} 
                  to={`/destinations/${relatedDest.slug}`}
                  className="group"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={relatedDest.image_url || '/placeholder.svg'} 
                        alt={relatedDest.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold py-1 px-2 rounded">
                        {relatedDest.category}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold">{relatedDest.name}</h3>
                        <div className="text-primary font-semibold">₹{relatedDest.price?.toLocaleString()}</div>
                      </div>
                      <p className="text-muted-foreground text-sm flex items-center mb-2">
                        <MapPin size={12} className="mr-1" /> {relatedDest.country}
                      </p>
                      <div className="flex items-center text-xs">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(relatedDest.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-muted-foreground">
                          {relatedDest.rating?.toFixed(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetail;
