
import { Compass, HeartPulse, Award, Coffee } from 'lucide-react';

const categories = [
  { name: "Adventure", icon: <Compass className="h-6 w-6" /> },
  { name: "Relaxation", icon: <HeartPulse className="h-6 w-6" /> },
  { name: "Luxury", icon: <Award className="h-6 w-6" /> },
  { name: "Cultural", icon: <Coffee className="h-6 w-6" /> }
];

export const TravelCategories = () => {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Tailored Experiences
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore by Travel Style</h2>
          <p className="text-muted-foreground">
            Discover destinations that match your unique travel personality and preferences.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div 
              key={category.name}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm">
                  Destinations tailored for {category.name.toLowerCase()} seekers.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
