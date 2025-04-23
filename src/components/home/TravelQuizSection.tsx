
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TravelQuizSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full mb-4">
              Personalized Travel
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Your Travel Personality?</h2>
            <p className="text-white/90 mb-6">
              Take our quick quiz to discover your unique travel personality and get customized recommendations that perfectly match your style and preferences.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Tailored Recommendations</h4>
                  <p className="text-white/80 text-sm">
                    Get destination suggestions that match your unique travel style.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-full mr-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Personalized Itineraries</h4>
                  <p className="text-white/80 text-sm">
                    Discover experiences handpicked to match your interests and preferences.
                  </p>
                </div>
              </div>
            </div>
            <Link to="/quiz">
              <Button variant="secondary" size="lg" className="rounded-full text-primary font-medium">
                Take the Quiz
              </Button>
            </Link>
          </div>
          <div className="lg:pl-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 shadow-xl">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-2">Are you a...</h3>
                  <p className="text-white/80">Find your travel personality</p>
                </div>
                <div className="space-y-4">
                  {["Thrill Seeker", "Cultural Explorer", "Relaxation Enthusiast", "Luxury Connoisseur"].map((type) => (
                    <div 
                      key={type}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-colors cursor-pointer"
                    >
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="personality" className="sr-only" />
                        <span className="w-5 h-5 rounded-full border-2 border-white mr-3 flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-white hidden"></span>
                        </span>
                        <span className="font-medium">{type}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <p className="text-white/80 text-sm mb-4">
                    Complete the full quiz for accurate recommendations
                  </p>
                  <Link to="/quiz">
                    <button className="bg-white text-primary font-medium px-8 py-3 rounded-full hover:shadow-lg transition-all hover:translate-y-[-2px]">
                      Continue to Full Quiz
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
