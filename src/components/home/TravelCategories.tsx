
import { Compass, HeartPulse, Award, Coffee } from 'lucide-react';

const categories = [
  { name: "Adventure", icon: <Compass className="h-5 w-5" />, description: "Destinations tailored for adventure seekers." },
  { name: "Relaxation", icon: <HeartPulse className="h-5 w-5" />, description: "Destinations tailored for relaxation seekers." },
  { name: "Luxury", icon: <Award className="h-5 w-5" />, description: "Destinations tailored for luxury seekers." },
  { name: "Cultural", icon: <Coffee className="h-5 w-5" />, description: "Destinations tailored for cultural seekers." }
];

export const TravelCategories = () => {
  return (
    <section className="section-border">
      <div className="container-custom">
        <div className="py-16">
          <div className="flex items-baseline justify-between mb-12">
            <div>
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2 block">
                Tailored Experiences
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Explore by Travel Style</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs hidden md:block">
              Discover destinations that match your unique travel personality and preferences.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => (
              <div 
                key={category.name}
                className="border border-border p-6 md:p-8 flex flex-col justify-between min-h-[200px] group hover:bg-accent transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{category.name}</span>
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {category.icon}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-auto pt-8">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
