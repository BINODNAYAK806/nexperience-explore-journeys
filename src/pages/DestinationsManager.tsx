
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import DestinationForm from '@/components/dashboard/destinations/DestinationForm';
import DestinationTable from '@/components/dashboard/destinations/DestinationTable';
import { supabase } from '@/integrations/supabase/client';

const DestinationsManager = () => {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchDestinations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Destinations</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading destinations...</div>
      ) : (
        <DestinationTable
          destinations={destinations}
          onRefresh={fetchDestinations}
        />
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Destination</DialogTitle>
          </DialogHeader>
          <DestinationForm
            mode="create"
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              fetchDestinations();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DestinationsManager;
