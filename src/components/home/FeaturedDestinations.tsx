
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import { travelDestinations } from '@/data/destinations';

export const FeaturedDestinations = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="section-border">
      <div className="container-custom">
        <div className="py-16">
          <div className="flex items-baseline justify-between mb-12">
            <div>
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2 block">
                Featured Destinations
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Popular Experiences</h2>
            </div>
            <Link
              to="/destinations"
              className="hidden md:inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              View all destinations
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>

          <p className="text-muted-foreground max-w-2xl mb-10">
            Immerse yourself in our most sought-after travel experiences, each with unique stories to discover.
          </p>

          {/* Specs Table / Data List */}
          <div className="border-t border-border">
            {travelDestinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/destinations/${destination.id}`}
                className="group relative block"
                onMouseEnter={() => setHoveredId(destination.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="border-b border-border py-5 md:py-6 flex items-center justify-between gap-4 transition-colors duration-200 hover:bg-accent px-4 -mx-4">
                  {/* Col 1: Destination name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-2xl font-semibold tracking-tight">
                      {destination.name} tour package
                    </h3>
                  </div>

                  {/* Col 2: Country tag */}
                  <div className="hidden sm:block flex-shrink-0">
                    <span className="text-xs font-mono text-muted-foreground border border-border px-3 py-1 uppercase tracking-wider">
                      {destination.country}
                    </span>
                  </div>

                  {/* Col 3: Category */}
                  <div className="hidden md:block flex-shrink-0 w-24 text-center">
                    <span className="text-xs text-muted-foreground">
                      {destination.category}
                    </span>
                  </div>

                  {/* Col 4: Rating */}
                  <div className="hidden md:block flex-shrink-0 w-16 text-center">
                    <span className="text-sm font-mono text-muted-foreground">
                      {destination.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Col 5: WhatsApp */}
                  <div className="flex-shrink-0">
                    <button
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
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
                    </button>
                  </div>

                  {/* Col 6: Price */}
                  <div className="flex-shrink-0 w-24 text-right">
                    <span className="text-base md:text-lg font-semibold font-mono">
                      {destination.price}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowUpRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                {/* Hover image overlay */}
                {hoveredId === destination.id && (
                  <div className="hidden lg:block absolute right-0 top-0 h-full w-80 z-10 pointer-events-none overflow-hidden">
                    <img
                      src={destination.image}
                      alt={`${destination.name} tour package - ${destination.category} travel destination in ${destination.country}`}
                      className="w-full h-full object-cover opacity-90 animate-fade-in"
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile: View all link */}
          <div className="mt-8 md:hidden">
            <Link
              to="/destinations"
              className="inline-flex items-center text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              View all destinations
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
