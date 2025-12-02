import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const txnId = searchParams.get('txnId');
      const destinationSlug = searchParams.get('destination');

      if (!txnId) {
        setStatus('Invalid payment callback');
        setTimeout(() => navigate('/payment-failed'), 2000);
        return;
      }

      try {
        setStatus('Checking payment status...');

        const { data, error } = await supabase.functions.invoke('phonepe-payment', {
          body: { merchantTransactionId: txnId },
          headers: { 'Content-Type': 'application/json' },
        });

        if (error) throw error;

        // Get stored payment details
        const storedDetails = sessionStorage.getItem('paymentDetails');
        const paymentDetails = storedDetails ? JSON.parse(storedDetails) : null;

        if (data?.success) {
          // Payment successful
          const queryParams = new URLSearchParams({
            txnId: txnId,
            destination: destinationSlug || paymentDetails?.destination || '',
            destinationName: paymentDetails?.destinationName || '',
            amount: paymentDetails?.amount?.toString() || '',
          });
          navigate(`/payment-success?${queryParams.toString()}`);
        } else {
          // Payment failed
          const queryParams = new URLSearchParams({
            txnId: txnId,
            reason: data?.message || 'Payment was not successful',
          });
          navigate(`/payment-failed?${queryParams.toString()}`);
        }

        // Clear stored payment details
        sessionStorage.removeItem('paymentDetails');
      } catch (error: any) {
        console.error('Payment verification error:', error);
        navigate(`/payment-failed?reason=${encodeURIComponent(error.message || 'Verification failed')}`);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">{status}</h2>
        <p className="text-muted-foreground">Please wait, do not close this window...</p>
      </div>
    </div>
  );
};

export default PaymentCallback;
