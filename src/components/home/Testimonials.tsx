import { Card, CardContent } from '@/components/ui/card';
import { ReviewForm } from './ReviewForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  destination: string;
  review_text: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

export const Testimonials = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['featured-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Review[];
    }
  });

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Traveler Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Experiences from Our Travelers</h2>
          <p className="text-muted-foreground mb-6">
            Verified reviews from fellow explorers who have experienced the NexYatra difference.
          </p>
          <ReviewForm />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Skeleton className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Be the first to share your travel experience with NexYatra!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id}>
                <Card className="h-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="mr-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">{review.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Traveled to {review.destination}
                        </p>
                      </div>
                    </div>
                    <p className="italic text-muted-foreground">"{review.review_text}"</p>
                    <div className="mt-4 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
