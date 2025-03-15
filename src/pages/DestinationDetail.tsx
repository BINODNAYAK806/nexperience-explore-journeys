
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Clock, Calendar, Users, 
  Heart, Share2, BookOpen, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Use the same destination data from the Destinations page
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
    bookings: 258,
    duration: "5 nights / 6 days",
    bestTime: "November to March",
    highlights: [
      "Visit the iconic Burj Khalifa, the tallest building in the world",
      "Experience an exhilarating desert safari with dune bashing",
      "Shop at the Dubai Mall, one of the world's largest shopping centers",
      "Explore the historic Al Fahidi district and traditional souks",
      "Relax on the pristine beaches of Palm Jumeirah"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "5-star hotel accommodation",
      "Daily breakfast and select meals",
      "Airport transfers in luxury vehicles",
      "Desert safari with BBQ dinner",
      "Burj Khalifa 'At The Top' experience",
      "Half-day city tour with professional guide",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1582672752286-2c65c06127e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1526495124232-a04e1849168c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1576467825668-fe3f911c5e90?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 189,
    duration: "6 nights / 7 days",
    bestTime: "October to March",
    highlights: [
      "Cruise through the tranquil backwaters on a traditional houseboat",
      "Explore the tea plantations of Munnar",
      "Experience authentic Ayurvedic treatments and wellness therapies",
      "Visit Thekkady's Periyar Wildlife Sanctuary",
      "Discover the culture and history of Fort Kochi"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Luxury houseboat stay (1 night)",
      "4-star hotel accommodations (5 nights)",
      "Daily breakfast and select meals",
      "Private air-conditioned vehicle for sightseeing",
      "Kathakali dance performance",
      "Spice plantation tour",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1602415151078-5c845bd959e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1568633712642-122e6d09d30b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1590154242340-a0d7c04a55a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 312,
    duration: "7 nights / 8 days",
    bestTime: "April to October",
    highlights: [
      "Visit sacred temples like Tanah Lot and Uluwatu",
      "Explore the iconic Tegallalang Rice Terraces",
      "Experience the vibrant beach clubs of Seminyak",
      "Trek to the summit of Mount Batur for sunrise",
      "Discover the cultural heart of Bali in Ubud"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Luxury villa accommodation with private pool",
      "Daily breakfast and select meals",
      "Airport transfers and private transportation",
      "Full-day Ubud tour with lunch",
      "Traditional Balinese massage",
      "Sunset dinner cruise",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1573790387438-4da905039392?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 154,
    duration: "5 nights / 6 days",
    bestTime: "March to June, October to November",
    highlights: [
      "Visit the majestic Rohtang Pass for snow activities",
      "Experience adrenaline-pumping paragliding in Solang Valley",
      "Explore the ancient Hadimba Temple surrounded by cedar forests",
      "Trek through the pristine trails of Great Himalayan National Park",
      "Relax in the natural hot springs of Vashisht"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Boutique hotel or cottage accommodation",
      "Daily breakfast and select meals",
      "Private SUV transportation for sightseeing",
      "Guided trek to hidden waterfall",
      "Paragliding experience (subject to weather)",
      "River rafting session",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1596461010768-1bed322add08?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1589830400120-30c969a71693?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1599922543571-4a9675cb57f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1585116938581-0a8c1aaa3f88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 201,
    duration: "6 nights / 7 days",
    bestTime: "November to April",
    highlights: [
      "Discover the stunning Phi Phi Islands and Maya Bay",
      "Visit the massive Big Buddha statue with panoramic views",
      "Experience the vibrant nightlife of Patong Beach",
      "Explore the charming colonial architecture of Old Phuket Town",
      "Relax on the pristine beaches of Karon and Kata"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Beachfront resort accommodation",
      "Daily breakfast and select meals",
      "Airport transfers and ferry tickets",
      "Full-day Phi Phi Islands tour with lunch",
      "Thai cooking class with market visit",
      "Traditional Thai massage",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1540879286235-2f28f76a7573?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1595159499889-8bfc79f6e936?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1556953410-78dcabbfc399?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 176,
    duration: "5 nights / 6 days",
    bestTime: "November to April",
    highlights: [
      "Stay in a luxurious overwater villa with direct ocean access",
      "Snorkel or dive among colorful coral reefs and marine life",
      "Experience a romantic sunset dolphin cruise",
      "Enjoy a private dinner on a secluded sandbank",
      "Indulge in world-class spa treatments overlooking the ocean"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Overwater villa accommodation",
      "All-inclusive meal plan (breakfast, lunch, dinner)",
      "Speedboat or seaplane transfers",
      "Snorkeling equipment and guided reef tour",
      "Sunset cruise with champagne",
      "Couples spa treatment",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1544550581-1bcabf842b77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 143,
    duration: "6 nights / 7 days",
    bestTime: "April to June, September to October",
    highlights: [
      "Visit the iconic Eiffel Tower and enjoy panoramic city views",
      "Explore the world's largest art museum, the Louvre",
      "Cruise along the Seine River past famous monuments",
      "Wander through the artistic neighborhood of Montmartre",
      "Experience French gastronomy with wine and cheese tastings"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Boutique hotel accommodation in central Paris",
      "Daily breakfast and select gourmet experiences",
      "Paris Museum Pass for skip-the-line access",
      "Seine River dinner cruise",
      "Guided walking tour of historic neighborhoods",
      "Day trip to Versailles Palace",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1551634979-2b11f8c946fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1541171382774-2c5c9a65a2a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
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
    bookings: 132,
    duration: "7 nights / 8 days",
    bestTime: "March to May, October to November",
    highlights: [
      "Walk through the thousands of vermillion torii gates at Fushimi Inari Shrine",
      "Visit the magnificent Golden Pavilion (Kinkaku-ji)",
      "Experience the tranquility of the Arashiyama Bamboo Grove",
      "Explore the historic Gion district and spot geisha",
      "Participate in a traditional Japanese tea ceremony"
    ],
    inclusions: [
      "Return flights from major Indian cities",
      "Traditional ryokan stay (2 nights) and hotel accommodation (5 nights)",
      "Daily breakfast and select authentic meals",
      "Japan Rail Pass for transportation",
      "Cultural experiences (tea ceremony, kimono dressing)",
      "Guided tour of major temples and shrines",
      "Day trip to Nara Deer Park",
      "All taxes and service charges"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
  }
];

const DestinationDetail = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState<any>(null);

  useEffect(() => {
    // Find the destination based on the ID
    const found = allDestinations.find(dest => dest.id === id);
    
    if (found) {
      setDestination(found);
    }
    
    // Simulate short loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

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

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src={destination.image} 
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
                <span>Best time: {destination.bestTime}</span>
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
                  {destination.highlights.map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 mr-2">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="inclusions" className="space-y-4">
                <ul className="space-y-2">
                  {destination.inclusions.map((inclusion: string, index: number) => (
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
              {destination.gallery.map((image: string, index: number) => (
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
              {destination.activities.map((activity: string, index: number) => (
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
                    {destination.price}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">per person on twin sharing</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-medium">{destination.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">{destination.price}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mb-3">Book Now</Button>
                  <Button variant="outline" className="w-full">Customize Package</Button>
                  
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
      <div className="bg-muted/30">
        <div className="container-custom py-12">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allDestinations
              .filter((d) => d.id !== destination.id && d.category === destination.category)
              .slice(0, 3)
              .map((relatedDest) => (
                <Link 
                  key={relatedDest.id} 
                  to={`/destinations/${relatedDest.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={relatedDest.image} 
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
                        <div className="text-primary font-semibold">{relatedDest.price}</div>
                      </div>
                      <p className="text-muted-foreground text-sm flex items-center mb-2">
                        <MapPin size={12} className="mr-1" /> {relatedDest.country}
                      </p>
                      <div className="flex items-center text-xs">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(relatedDest.rating) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-muted-foreground">
                          {relatedDest.rating.toFixed(1)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
