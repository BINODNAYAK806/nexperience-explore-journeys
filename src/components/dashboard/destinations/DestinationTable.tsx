
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import DestinationForm from './DestinationForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Destination {
  id: string;
  name: string;
  country: string;
  price: number;
  category: string;
  trending: boolean;
  bookings: number;
}

interface DestinationTableProps {
  destinations: Destination[];
  onRefresh: () => void;
}

const DestinationTable = ({ destinations, onRefresh }: DestinationTableProps) => {
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [deletingDestination, setDeletingDestination] = useState<Destination | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deletingDestination) return;

    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', deletingDestination.id)
        .select('count');

      if (error) throw error;

      toast({
        title: 'Destination deleted',
        description: 'The destination has been successfully deleted.'
      });

      onRefresh();
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete destination. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingDestination(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {destinations.map((destination) => (
            <TableRow key={destination.id}>
              <TableCell className="font-medium">{destination.name}</TableCell>
              <TableCell>{destination.country}</TableCell>
              <TableCell>₹{destination.price.toLocaleString()}</TableCell>
              <TableCell>{destination.category}</TableCell>
              <TableCell>
                {destination.trending && (
                  <Badge>Trending</Badge>
                )}
              </TableCell>
              <TableCell>{destination.bookings}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingDestination(destination)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeletingDestination(destination)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editingDestination} onOpenChange={() => setEditingDestination(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
          </DialogHeader>
          {editingDestination && (
            <DestinationForm
              mode="edit"
              initialData={editingDestination}
              onSuccess={() => {
                setEditingDestination(null);
                onRefresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingDestination} onOpenChange={() => setDeletingDestination(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the destination
              {deletingDestination && ` "${deletingDestination.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DestinationTable;
