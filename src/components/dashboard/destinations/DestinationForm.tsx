
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DestinationFormData {
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
            error={errors.name?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register('country', { required: 'Country is required' })}
            error={errors.country?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location', { required: 'Location is required' })}
            error={errors.location?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            {...register('price', { required: 'Price is required' })}
            error={errors.price?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            {...register('duration', { required: 'Duration is required' })}
            error={errors.duration?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="best_time">Best Time to Visit</Label>
          <Input
            id="best_time"
            {...register('best_time', { required: 'Best time to visit is required' })}
            error={errors.best_time?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            {...register('category', { required: 'Category is required' })}
            error={errors.category?.message}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            {...register('image_url', { required: 'Image URL is required' })}
            error={errors.image_url?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          error={errors.description?.message}
          rows={4}
        />
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
