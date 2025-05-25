
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyRequestForm } from '@/components/home/JourneyRequestForm';
import { TravelCategories } from '@/components/home/TravelCategories';
import { FeaturedDestinations } from '@/components/home/FeaturedDestinations';
import { Testimonials } from '@/components/home/Testimonials';
import { TravelQuizSection } from '@/components/home/TravelQuizSection';

const Index = () => {
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
            <source src="https://videocdn.cdnpk.net/videos/d881af8f-c9f9-4499-952e-cd1219ba494c/horizontal/previews/clear/large.mp4?token=exp=1742751370~hmac=9222d9f0efff105c82b8a190af79bd2fb68f2c45f8ba96822fc1b4fbdcea2f10" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="container-custom relative z-10 py-20">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/lovable-uploads/a386c642-4a2f-4373-8587-b39922d4f13d.png" 
              alt="NexYatra Logo" 
              className="h-16 md:h-20 lg:h-24 w-auto"
            />
          </div>
          
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

            <JourneyRequestForm />

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

      <TravelCategories />
      <FeaturedDestinations />
      <TravelQuizSection />
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
