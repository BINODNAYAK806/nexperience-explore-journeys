
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

interface DestinationFormData {
  id?: string; // Added id as optional property
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
}

interface DestinationFormProps {
  initialData?: Partial<DestinationFormData>;
  onSuccess: () => void;
  mode: 'create' | 'edit';
}

const DestinationForm = ({ initialData, onSuccess, mode }: DestinationFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<DestinationFormData>({
    defaultValues: initialData || {}
  });
  const { toast } = useToast();

  const onSubmit = async (data: DestinationFormData) => {
    try {
      const slug = data.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
      
      if (mode === 'create') {
        const { error } = await supabase
          .from('destinations')
          .insert([{ ...data, slug }]);

        if (error) throw error;
        
        toast({
          title: "Destination created",
          description: "The destination has been successfully created."
        });
      } else {
        const { error } = await supabase
          .from('destinations')
          .update({ ...data, slug })
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            {...register('image_url', { required: 'Image URL is required' })}
          />
          {errors.image_url && (
            <p className="text-sm text-red-500">{errors.image_url.message}</p>
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
  );
};

export default DestinationForm;
