import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyRequestForm } from '@/components/home/JourneyRequestForm';
import { TravelCategories } from '@/components/home/TravelCategories';
import { FeaturedDestinations } from '@/components/home/FeaturedDestinations';
import { Testimonials } from '@/components/home/Testimonials';
import SEO, { getOrganizationSchema, getWebsiteSchema, getLocalBusinessSchema } from '@/components/SEO';

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebsiteSchema(),
      getLocalBusinessSchema()
    ]
  };

  return (
    <div className="opacity-100">
      <SEO 
        title="NexYatra - Affordable Travel Packages from Surat | Dubai, Bali, Kerala Tours 2026"
        description="Book affordable travel packages to Dubai, Bali, Kerala, Manali & more starting ₹8,999. NexYatra - Surat's trusted travel agency. Customized holiday packages with best prices. Free cancellation!"
        keywords="travel packages from Surat, affordable tours 2026, Dubai tour packages, Bali holidays, Kerala backwaters trip, Manali trips, budget travel India, holiday packages, NexYatra travel agency, international tours from Gujarat, domestic tour packages, honeymoon packages, family vacation deals"
        url="https://www.nexyatra.in"
        structuredData={structuredData}
      />

      {/* Hero Section — Left-aligned, text-first */}
      <section className="min-h-screen flex items-end pb-20 pt-32 section-border">
        <div className="container-custom w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div className="flex flex-col">
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6">
                Next-level Travel Experiences
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-foreground leading-[0.9] tracking-tight mb-8">
                Affordable Travel Packages from <span className="italic font-light">Surat</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
                Book customized holiday packages to Dubai, Bali, Kerala, Manali & more. Best prices guaranteed from NexYatra!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <JourneyRequestForm />
              </div>
            </div>

            {/* Right side — abstract minimal visual */}
            <div className="hidden lg:flex items-end justify-end">
              <div className="w-full max-w-md aspect-square border border-border relative">
                <div className="absolute inset-4 border border-border"></div>
                <div className="absolute inset-8 border border-border"></div>
                <div className="absolute inset-12 border border-border"></div>
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono">
                  395007 — Surat, GJ
                </div>
                <div className="absolute top-4 right-4 text-xs text-muted-foreground font-mono">
                  21.1702°N
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TravelCategories />
      <FeaturedDestinations />
      <Testimonials />

      {/* CTA Section */}
      <section className="py-24 section-border-top">
        <div className="container-custom">
          <div className="max-w-4xl">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-6 block">
              Begin Your Journey
            </span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[0.95] tracking-tight">
              Ready to Discover Your Next Adventure?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl leading-relaxed">
              Start planning your personalized travel experience today and create memories that will last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/destinations">
                <Button className="rounded-none px-8 py-6 text-base font-medium">
                  Explore Destinations
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-none px-8 py-6 text-base font-medium border-foreground text-foreground hover:bg-foreground hover:text-background">
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
