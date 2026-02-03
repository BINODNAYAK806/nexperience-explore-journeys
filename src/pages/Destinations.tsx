import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, ChevronRight, ArrowDownAZ, Landmark, Compass, Coffee, Utensils, Camera, Users, Heart, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SEO, { getBreadcrumbSchema } from '@/components/SEO';

const activities = [{
  name: "Sightseeing",
  icon: <Landmark size={18} />
}, {
  name: "Adventures",
  icon: <Compass size={18} />
}, {
  name: "Cultural",
  icon: <Coffee size={18} />
}, {
  name: "Culinary",
  icon: <Utensils size={18} />
}, {
  name: "Photography",
  icon: <Camera size={18} />
}, {
  name: "Family",
  icon: <Users size={18} />
}];

const categories = ["All", "Luxury", "Beach", "Adventure"];

const Destinations = () => {
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const {
    data: destinations = [],
    isLoading
  } = useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('destinations').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');

  useEffect(() => {
    let results = [...destinations];
    
    // Category filter
    if (activeCategory !== "All") {
      results = results.filter(destination => destination.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(destination => 
        destination.name?.toLowerCase().includes(query) || 
        destination.country?.toLowerCase().includes(query) || 
        destination.description?.toLowerCase().includes(query)
      );
    }

    // Activities filter
    if (selectedActivities.length > 0) {
      results = results.filter(destination => {
        // Check if activities exist and is an array
        const activitiesArray = Array.isArray(destination.activities) 
          ? destination.activities as string[] 
          : [];
          
        return selectedActivities.every(activity => 
          activitiesArray.includes(activity)
        );
      });
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      results = results.filter(destination => {
        const price = destination.price || 0;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sorting
    if (sortBy === "trending") {
      results.sort((a, b) => (b.bookings || 0) - (a.bookings || 0));
    } else if (sortBy === "priceAsc") {
      results.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "priceDesc") {
      results.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredDestinations(results);
  }, [activeCategory, searchQuery, sortBy, destinations, selectedActivities, priceRange]);

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "https://nexperience-explore-journeys.lovable.app/" },
    { name: "Destinations", url: "https://nexperience-explore-journeys.lovable.app/destinations" }
  ]);

  return (
    <div className="opacity-100">
      <SEO 
        title="Explore Travel Destinations | Affordable Tour Packages - NexYatra"
        description="Discover affordable travel packages to Dubai, Bali, Kerala, Manali and more. Compare prices, read reviews, and book your perfect holiday. Starting from ₹8,999."
        keywords="travel destinations, tour packages, Dubai tours, Bali packages, Kerala holidays, Manali trips, adventure travel, luxury resorts, budget travel India"
        structuredData={breadcrumbSchema}
      />
      <section className="relative py-32 flex items-center overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-900/70"></div>
          <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Travel Map" className="w-full h-full object-cover" />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Explore Extraordinary Destinations
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Discover handpicked experiences and create unforgettable memories around the world.
            </p>

            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input type="text" placeholder="Search destinations, countries, or experiences..." className="w-full bg-white/90 backdrop-blur-sm border-0 rounded-full py-3 pl-12 pr-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                {filteredDestinations.length} Destinations{' '}
                {activeCategory !== 'All' && <span>in {activeCategory}</span>}
              </h2>
              
              <div className="flex items-center space-x-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                    <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="All" className="w-full">
              <TabsList className="flex overflow-x-auto pb-1 max-w-full hide-scrollbar">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category} 
                    onClick={() => setActiveCategory(category)}
                    className="px-4 py-2 whitespace-nowrap"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Collapsible>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Filter size={16} />
                      <span>Filters</span>
                    </Button>
                  </CollapsibleTrigger>
                  {selectedActivities.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedActivities.length} selected
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setSelectedActivities([])}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  )}
                </div>
              </div>

              <CollapsibleContent>
                <div className="space-y-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Activities</h3>
                    <ToggleGroup 
                      type="multiple" 
                      value={selectedActivities}
                      onValueChange={setSelectedActivities}
                      className="flex flex-wrap gap-2"
                    >
                      {activities.map(activity => (
                        <ToggleGroupItem
                          key={activity.name}
                          value={activity.name}
                          aria-label={activity.name}
                          className="flex items-center gap-2 bg-white dark:bg-gray-800"
                        >
                          {activity.icon}
                          <span>{activity.name}</span>
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Price Range</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full"
                        />
                        <span>-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any Duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Duration</SelectItem>
                          <SelectItem value="1-3">1-3 Days</SelectItem>
                          <SelectItem value="4-7">4-7 Days</SelectItem>
                          <SelectItem value="8-14">8-14 Days</SelectItem>
                          <SelectItem value="15+">15+ Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Travel Season</label>
                      <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any Season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Season</SelectItem>
                          <SelectItem value="winter">Winter</SelectItem>
                          <SelectItem value="spring">Spring</SelectItem>
                          <SelectItem value="summer">Summer</SelectItem>
                          <SelectItem value="fall">Fall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedActivities([]);
                        setPriceRange({ min: '', max: '' });
                        setSelectedDuration('');
                        setSelectedSeason('');
                      }}
                    >
                      Reset All
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <Card key={n} className="overflow-hidden border-0 shadow-md h-full animate-pulse">
                    <div className="h-56 bg-gray-200" />
                    <CardContent className="p-5">
                      <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDestinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map(destination => (
                  <Link key={destination.id} to={`/destinations/${destination.slug}`} className="group">
                    <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] h-full">
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={destination.image_url || '/placeholder.svg'} 
                          alt={destination.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        {destination.trending && (
                          <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold py-1 px-2 rounded-full flex items-center">
                            <span className="animate-pulse mr-1 w-2 h-2 bg-white rounded-full"></span>
                            Trending
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-3 right-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          <Heart size={16} />
                        </Button>
                        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold py-1 px-2 rounded">
                          {destination.category}
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{destination.name}</h3>
                            <p className="text-muted-foreground text-sm flex items-center">
                              <MapPin size={14} className="mr-1" /> {destination.country}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-primary">₹{destination.price?.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">per person</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {destination.description}
                        </p>
                        
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {(destination.activities as string[] || []).slice(0, 3).map((activity, i) => (
                              <Badge key={i} variant="secondary" className="font-normal text-xs">
                                {activity}
                              </Badge>
                            ))}
                            {(destination.activities as string[] || []).length > 3 && (
                              <Badge variant="outline" className="font-normal text-xs">
                                +{(destination.activities as string[] || []).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(destination.rating || 0) ? "text-yellow-400" : "text-gray-300"}`} 
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs ml-1 text-muted-foreground">
                              {destination.rating?.toFixed(1)}
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
            ) : (
              <div className="text-center py-12">
                <div className="mb-4 flex justify-center">
                  <Search size={48} className="text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setSortBy('trending');
                  setIsFiltersVisible(false);
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488441770602-aed21fc49bd5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] opacity-20 bg-cover bg-center"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center md:justify-between gap-8">
              <div className="text-white md:max-w-md">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Get Personalized Travel Inspirations</h3>
                <p className="opacity-90 mb-4">
                  Join our community and receive customized destination ideas, exclusive offers, and travel tips directly to your inbox.
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-sm opacity-90">No spam, unsubscribe at any time</span>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="email" placeholder="Your email address" className="px-4 py-3 rounded-lg flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-white/50" />
                  <Button className="bg-white text-primary hover:bg-white/90 rounded-lg">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Destinations;
