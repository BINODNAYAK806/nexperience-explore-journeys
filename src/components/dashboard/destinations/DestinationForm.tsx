import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Json } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DestinationFormData {
  id?: string;
  name: string;
  country: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  best_time: string;
  category: string;
  image_url: string;
  trending: boolean;
  highlights: string;
  inclusions: string;
  gallery: string;
  activities: string;
  bookings: number;
  rating: number;
  overview: string;
}

interface DestinationFormProps {
  initialData?: Partial<DestinationFormData>;
  onSuccess: () => void;
  mode: 'create' | 'edit';
}

const DestinationForm = ({ initialData, onSuccess, mode }: DestinationFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DestinationFormData>({
    defaultValues: {
      ...initialData,
      highlights: Array.isArray(initialData?.highlights) 
        ? initialData?.highlights.join('\n') 
        : initialData?.highlights || '',
      inclusions: Array.isArray(initialData?.inclusions) 
        ? initialData?.inclusions.join('\n') 
        : initialData?.inclusions || '',
      gallery: Array.isArray(initialData?.gallery) 
        ? initialData?.gallery.join('\n') 
        : initialData?.gallery || '',
      activities: Array.isArray(initialData?.activities) 
        ? initialData?.activities.join('\n') 
        : initialData?.activities || '',
    }
  });
  const { toast } = useToast();

  const onSubmit = async (data: DestinationFormData) => {
    try {
      const slug = data.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
      
      const highlightsArray = data.highlights.split('\n').filter(item => item.trim() !== '');
      const inclusionsArray = data.inclusions.split('\n').filter(item => item.trim() !== '');
      const galleryArray = data.gallery.split('\n').filter(item => item.trim() !== '');
      const activitiesArray = data.activities.split('\n').filter(item => item.trim() !== '');
      
      const formattedData = {
        ...data,
        highlights: highlightsArray as unknown as string,
        inclusions: inclusionsArray as unknown as Json,
        gallery: galleryArray as unknown as Json,
        activities: activitiesArray as unknown as Json,
        slug
      };
      
      if (mode === 'create') {
        const { error } = await supabase
          .from('destinations')
          .insert(formattedData);

        if (error) throw error;
        
        toast({
          title: "Destination created",
          description: "The destination has been successfully created."
        });
      } else {
        const { error } = await supabase
          .from('destinations')
          .update(formattedData)
          .eq('id', initialData?.id);

        if (error) throw error;
        
        toast({
          title: "Destination updated",
          description: "The destination has been successfully updated."
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving destination:', error);
      toast({
        title: "Error",
        description: "Failed to save destination. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <ScrollArea className="h-[600px] w-full pr-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Destination Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location', { required: 'Location is required' })}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              {...register('price', { required: 'Price is required' })}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              {...register('duration', { required: 'Duration is required' })}
            />
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="best_time">Best Time to Visit</Label>
            <Input
              id="best_time"
              {...register('best_time', { required: 'Best time to visit is required' })}
            />
            {errors.best_time && (
              <p className="text-sm text-red-500">{errors.best_time.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register('category', { required: 'Category is required' })}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Main Image URL</Label>
            <Input
              id="image_url"
              {...register('image_url', { required: 'Image URL is required' })}
            />
            {errors.image_url && (
              <p className="text-sm text-red-500">{errors.image_url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              {...register('rating', { 
                required: 'Rating is required',
                min: { value: 0, message: 'Rating must be at least 0' },
                max: { value: 5, message: 'Rating must be at most 5' },
              })}
            />
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookings">Number of Bookings</Label>
            <Input
              id="bookings"
              type="number"
              min="0"
              {...register('bookings', { 
                required: 'Bookings count is required',
                min: { value: 0, message: 'Bookings must be at least 0' }
              })}
            />
            {errors.bookings && (
              <p className="text-sm text-red-500">{errors.bookings.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description', { required: 'Description is required' })}
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="overview">Overview</Label>
          <Textarea
            id="overview"
            {...register('overview')}
            rows={3}
          />
          {errors.overview && (
            <p className="text-sm text-red-500">{errors.overview.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="highlights">
            Highlights (one per line)
          </Label>
          <Textarea
            id="highlights"
            {...register('highlights', { required: 'At least one highlight is required' })}
            rows={5}
            placeholder="Visit the iconic Burj Khalifa
Experience an exhilarating desert safari
Shop at the Dubai Mall"
          />
          {errors.highlights && (
            <p className="text-sm text-red-500">{errors.highlights.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inclusions">
            Inclusions (one per line)
          </Label>
          <Textarea
            id="inclusions"
            {...register('inclusions', { required: 'At least one inclusion is required' })}
            rows={5}
            placeholder="Return flights from major Indian cities
5-star hotel accommodation
Daily breakfast and select meals"
          />
          {errors.inclusions && (
            <p className="text-sm text-red-500">{errors.inclusions.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="activities">
            Activities (one per line)
          </Label>
          <Textarea
            id="activities"
            {...register('activities', { required: 'At least one activity is required' })}
            rows={5}
            placeholder="Desert Safari
Burj Khalifa
Dubai Mall
Palm Jumeirah"
          />
          {errors.activities && (
            <p className="text-sm text-red-500">{errors.activities.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gallery">
            Gallery Image URLs (one per line)
          </Label>
          <Textarea
            id="gallery"
            {...register('gallery', { required: 'At least one gallery image is required' })}
            rows={5}
            placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg
https://example.com/image3.jpg"
          />
          {errors.gallery && (
            <p className="text-sm text-red-500">{errors.gallery.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="trending"
            {...register('trending')}
          />
          <Label htmlFor="trending">Mark as Trending</Label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Destination' : 'Update Destination'}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default DestinationForm;
