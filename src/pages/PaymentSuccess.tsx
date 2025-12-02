import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Home, MapPin, Receipt, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  
  const txnId = searchParams.get('txnId') || 'N/A';
  const destination = searchParams.get('destination') || '';
  const destinationName = searchParams.get('destinationName') || 'Your Trip';
  const amount = searchParams.get('amount') || '';

  const handleWhatsAppSupport = () => {
    const message = `Hi! I just completed a payment for ${destinationName}. Transaction ID: ${txnId}. Please confirm my booking.`;
    window.open(`https://wa.me/918347015725?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background dark:from-green-950/20 dark:to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-green-200 dark:border-green-900">
        <CardContent className="pt-8 pb-6 px-6 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for booking with NexYatra
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{destinationName}</p>
              </div>
            </div>

            {amount && (
              <div className="flex items-start gap-3">
                <Receipt className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="font-medium">₹{Number(amount).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-sm break-all">{txnId}</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Our team will contact you within 24 hours to confirm your booking details.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              className="w-full" 
              variant="secondary"
              onClick={handleWhatsAppSupport}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Confirm on WhatsApp
            </Button>

            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            {destination && (
              <Link to={`/destinations/${destination}`} className="block">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  View Destination Details
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
