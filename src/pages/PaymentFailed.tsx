import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, Home, RefreshCcw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  
  const txnId = searchParams.get('txnId');
  const reason = searchParams.get('reason') || 'Payment could not be completed';

  const handleWhatsAppSupport = () => {
    const message = txnId 
      ? `Hi! I had an issue with my payment. Transaction ID: ${txnId}. Error: ${reason}. Can you help?`
      : `Hi! I had an issue completing my payment. Error: ${reason}. Can you help?`;
    window.open(`https://wa.me/918347015725?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-background dark:from-red-950/20 dark:to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-red-200 dark:border-red-900">
        <CardContent className="pt-8 pb-6 px-6 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-700 dark:text-red-400">
              Payment Failed
            </h1>
            <p className="text-muted-foreground">
              Don't worry, no amount has been deducted
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-left">
            <p className="text-sm text-muted-foreground">Reason</p>
            <p className="text-sm">{reason}</p>
            
            {txnId && (
              <>
                <p className="text-sm text-muted-foreground mt-3">Transaction ID</p>
                <p className="font-mono text-xs break-all">{txnId}</p>
              </>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              If any amount was deducted, it will be refunded within 5-7 business days.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link to="/destinations" className="block">
              <Button className="w-full">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>

            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleWhatsAppSupport}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact Support
            </Button>

            <Link to="/" className="block">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;
