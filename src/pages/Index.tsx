
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyRequestForm } from '@/components/home/JourneyRequestForm';
import { TravelCategories } from '@/components/home/TravelCategories';
import { FeaturedDestinations } from '@/components/home/FeaturedDestinations';
import { Testimonials } from '@/components/home/Testimonials';

const Index = () => {
  return (
    <div className="opacity-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 animate-[gradient_15s_ease_infinite] bg-[length:200%_200%]">
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-indigo-900/30"></div>
          
          {/* Animated floating shapes */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-[float_25s_ease-in-out_infinite_5s]"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-[float_30s_ease-in-out_infinite_10s]"></div>
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
              Immersive, personalized travel experiences tailored to your unique preferences.
            </p>

            <JourneyRequestForm />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-8 h-12 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-1 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      <TravelCategories />
      <FeaturedDestinations />
      <Testimonials />

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
              <Link to="/contact">
                <Button variant="outline" size="lg" className="rounded-full text-white border-white hover:bg-white/10 w-full sm:w-auto">
                  Contact Us
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
