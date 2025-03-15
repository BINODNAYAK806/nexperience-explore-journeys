
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, MapPin, ChevronRight, ArrowDownAZ,
  Landmark, Compass, Coffee, Utensils, Camera, Users, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

const allDestinations = [
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    description: "Experience the blend of modern luxury and Arabian heritage in this futuristic city rising from the desert. Explore iconic skyscrapers, traditional souks, and endless entertainment.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹75,000",
    rating: 4.8,
    category: "Luxury",
    activities: ["Desert Safari", "Burj Khalifa", "Dubai Mall", "Palm Jumeirah"],
    trending: true,
    bookings: 258
  },
  {
    id: "kerala",
    name: "Kerala",
    country: "India",
    description: "Discover serene backwaters, lush green landscapes, and pristine beaches in God's Own Country. Experience Ayurvedic treatments and vibrant cultural festivals.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹35,000",
    rating: 4.7,
    category: "Nature",
    activities: ["Backwater Cruise", "Ayurvedic Spa", "Tea Plantations", "Wildlife Safari"],
    trending: true,
    bookings: 189
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    description: "Immerse yourself in tropical paradise with stunning beaches, rice terraces, and vibrant culture. Explore ancient temples, surf world-class waves, and enjoy renowned hospitality.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹65,000",
    rating: 4.9,
    category: "Beach",
    activities: ["Temple Tours", "Surfing", "Rice Terrace Trek", "Monkey Forest"],
    trending: true,
    bookings: 312
  },
  {
    id: "manali",
    name: "Manali",
    country: "India",
    description: "Enjoy breathtaking Himalayan views, adventure activities, and serene landscapes. Perfect for thrill-seekers and nature lovers looking for mountain escapades.",
    image: "https://images.unsplash.com/photo-1626621341517-0f5b809f3a4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹25,000",
    rating: 4.6,
    category: "Adventure",
    activities: ["Paragliding", "Solang Valley", "Rohtang Pass", "Great Himalayan National Park"],
    trending: false,
    bookings: 154
  },
  {
    id: "phuket",
    name: "Phuket",
    country: "Thailand",
    description: "Thailand's largest island offers beautiful beaches, vibrant nightlife, and delicious cuisine. Explore limestone cliffs, turquoise waters, and cultural attractions.",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹45,000",
    rating: 4.5,
    category: "Beach",
    activities: ["Island Hopping", "Patong Beach", "Big Buddha", "Old Phuket Town"],
    trending: true,
    bookings: 201
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    description: "Experience paradise on Earth with overwater bungalows, crystal clear waters, and vibrant marine life. Perfect for honeymoons and luxury getaways.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹1,20,000",
    rating: 4.9,
    category: "Luxury",
    activities: ["Snorkeling", "Diving", "Sunset Cruise", "Spa Treatments"],
    trending: true,
    bookings: 176
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    description: "The City of Light captivates with its iconic landmarks, world-class museums, and charming neighborhoods. Experience romance, history, and culinary excellence.",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹85,000",
    rating: 4.7,
    category: "Cultural",
    activities: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise", "Montmartre"],
    trending: false,
    bookings: 143
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    description: "Japan's cultural capital offers traditional temples, serene gardens, and authentic experiences. Immerse yourself in centuries of history and tradition.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    price: "₹90,000",
    rating: 4.8,
    category: "Cultural",
    activities: ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji Temple", "Geisha District"],
    trending: false,
    bookings: 132
  }
];

// Filter categories
const categories = ["All", "Luxury", "Beach", "Adventure", "Nature", "Cultural"];
const activities = [
  { name: "Sightseeing", icon: <Landmark size={18} /> },
  { name: "Adventures", icon: <Compass size={18} /> },
  { name: "Cultural", icon: <Coffee size={18} /> },
  { name: "Culinary", icon: <Utensils size={18} /> },
  { name: "Photography", icon: <Camera size={18} /> },
  { name: "Family", icon: <Users size={18} /> },
];

const Destinations = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState(allDestinations);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const animatedElements = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    // Set up intersection observer for animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-enter');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isLoaded && observerRef.current) {
      // Get all elements to animate
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((el) => {
        observerRef.current?.observe(el);
        animatedElements.current.push(el as HTMLElement);
      });
    }

    return () => {
      if (observerRef.current) {
        animatedElements.current.forEach((el) => {
          observerRef.current?.unobserve(el);
        });
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    // Filter and sort destinations
    let results = [...allDestinations];
    
    // Apply category filter
    if (activeCategory !== "All") {
      results = results.filter(destination => destination.category === activeCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        destination => 
          destination.name.toLowerCase().includes(query) || 
          destination.country.toLowerCase().includes(query) ||
          destination.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === "trending") {
      results.sort((a, b) => b.bookings - a.bookings);
    } else if (sortBy === "priceAsc") {
      results.sort((a, b) => parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, '')));
    } else if (sortBy === "priceDesc") {
      results.sort((a, b) => parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, '')));
    } else if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredDestinations(results);
  }, [activeCategory, searchQuery, sortBy]);

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  return (
    <div className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative py-32 flex items-center overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-900/70"></div>
          <img 
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
            alt="Travel Map" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
              Explore Extraordinary Destinations
            </h1>
            <p className="text-lg text-white/90 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Discover handpicked experiences and create unforgettable memories around the world.
            </p>

            {/* Search Box */}
            <div className="relative max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search destinations, countries, or experiences..."
                className="w-full bg-white/90 backdrop-blur-sm border-0 rounded-full py-3 pl-12 pr-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-custom">
          {/* Tabs and Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold animate-on-scroll opacity-0">
                {filteredDestinations.length} Destinations{' '}
                {activeCategory !== 'All' && <span>in {activeCategory}</span>}
              </h2>
              
              <div className="flex items-center space-x-3 animate-on-scroll opacity-0" style={{ animationDelay: '100ms' }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleFilters}
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </Button>
                
                <select
                  className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="trending">Trending</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
            
            {/* Categories Tabs */}
            <Tabs defaultValue="All" className="w-full animate-on-scroll opacity-0" style={{ animationDelay: '200ms' }}>
              <TabsList className="flex overflow-x-auto pb-1 max-w-full hide-scrollbar">
                {categories.map((category) => (
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

            {/* Expanded Filters */}
            <div 
              className={`mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-border transition-all duration-300 overflow-hidden animate-on-scroll opacity-0 ${
                isFiltersVisible ? 'max-h-96' : 'max-h-0 p-0 mt-0 border-transparent'
              }`}
              style={{ animationDelay: '300ms' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {activities.map((activity) => (
                  <div key={activity.name} className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="flex items-center ml-2 text-sm">
                        {activity.icon}
                        <span className="ml-1.5">{activity.name}</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full p-2 bg-background border border-input rounded-md text-sm"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full p-2 bg-background border border-input rounded-md text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <select className="w-full p-2 bg-background border border-input rounded-md text-sm">
                    <option value="">Any Duration</option>
                    <option value="1-3">1-3 Days</option>
                    <option value="4-7">4-7 Days</option>
                    <option value="8-14">8-14 Days</option>
                    <option value="15+">15+ Days</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Travel Season</label>
                  <select className="w-full p-2 bg-background border border-input rounded-md text-sm">
                    <option value="">Any Season</option>
                    <option value="winter">Winter</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" className="mr-2">
                  Reset
                </Button>
                <Button size="sm">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Destinations Grid */}
          {filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDestinations.map((destination, index) => (
                <Link
                  key={destination.id}
                  to={`/destinations/${destination.id}`}
                  className="animate-on-scroll opacity-0 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-8px] h-full">
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={destination.image} 
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
                          <div className="font-semibold text-primary">{destination.price}</div>
                          <div className="text-xs text-muted-foreground">per person</div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {destination.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {destination.activities.slice(0, 3).map((activity, i) => (
                            <Badge key={i} variant="secondary" className="font-normal text-xs">
                              {activity}
                            </Badge>
                          ))}
                          {destination.activities.length > 3 && (
                            <Badge variant="outline" className="font-normal text-xs">
                              +{destination.activities.length - 3} more
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
          ) : (
            <div className="text-center py-12 animate-on-scroll opacity-0">
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
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 shadow-lg overflow-hidden relative animate-on-scroll opacity-0">
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
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-3 rounded-lg flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
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
