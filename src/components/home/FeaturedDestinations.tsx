
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { travelDestinations } from '@/data/destinations';

export const FeaturedDestinations = () => {
  return (
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
          {travelDestinations.map((destination) => (
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
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const message = `Hello, I'm interested in the ${destination.name} package. Can you provide more details?`;
                          const whatsappUrl = `https://wa.me/918347015725?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        title="Contact via WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </Button>
                      <span className="inline-flex items-center text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                        Explore <ChevronRight size={14} className="ml-1" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
