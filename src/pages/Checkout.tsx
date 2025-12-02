import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const { destination: destinationSlug } = useParams<{ destination: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const cleanSlug = destinationSlug?.replace(/-+$/, '') || '';

  const { data: destination, isLoading } = useQuery({
    queryKey: ['checkout-destination', cleanSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned.slice(-10));
  };

  const handlePayment = async () => {
    if (!validatePhone(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number",
        variant: "destructive",
      });
      return;
    }

    if (!destination?.price) {
      toast({
        title: "Error",
        description: "Unable to process payment. Price not available.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const callbackUrl = `${window.location.origin}/payment-callback`;
      
      const { data, error } = await supabase.functions.invoke('phonepe-payment?action=create-order', {
        body: {
          amount: destination.price,
          phone: phone,
          destinationName: destination.name,
          destinationSlug: cleanSlug,
          callbackUrl: callbackUrl,
        },
      });

      if (error) throw error;

      if (data?.success && data?.redirectUrl) {
        // Store transaction details in sessionStorage for callback
        sessionStorage.setItem('paymentDetails', JSON.stringify({
          txnId: data.merchantTransactionId,
          destination: cleanSlug,
          destinationName: destination.name,
          amount: destination.price,
          phone: phone,
        }));
        
        // Redirect to PhonePe payment page
        window.location.href = data.redirectUrl;
      } else {
        throw new Error(data?.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Unable to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Destination Not Found</h1>
        <p className="text-muted-foreground mb-6">The destination you're looking for doesn't exist.</p>
        <Link to="/destinations">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Browse Destinations
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container-custom py-8 md:py-12">
        <Link to={`/destinations/${cleanSlug}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to {destination.name}
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img 
                  src={destination.image_url || '/placeholder.svg'} 
                  alt={destination.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{destination.name}</h3>
                  <p className="text-muted-foreground text-sm">{destination.country}</p>
                  <p className="text-muted-foreground text-sm">{destination.duration}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>₹{destination.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{destination.price?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send booking confirmation to this number
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">Secure Payment via PhonePe</h4>
                <p className="text-xs text-muted-foreground">
                  You'll be redirected to PhonePe to complete the payment securely. 
                  Supports UPI, Cards, Net Banking & Wallets.
                </p>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing || !phone}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{destination.price?.toLocaleString()}</>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By proceeding, you agree to our Terms & Conditions and Refund Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
