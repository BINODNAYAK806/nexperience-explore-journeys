import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHONEPE_MERCHANT_ID = Deno.env.get('PHONEPE_MERCHANT_ID')!;
const PHONEPE_SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY')!;
const PHONEPE_SALT_INDEX = Deno.env.get('PHONEPE_SALT_INDEX') || '1';

// Production URL (merchant activated)
// Note: PhonePe updated their API - use /apis/pg for production
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/pg';

async function generateChecksum(payload: string, endpoint: string): Promise<string> {
  const data = payload + endpoint + PHONEPE_SALT_KEY;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex + '###' + PHONEPE_SALT_INDEX;
}

function base64Encode(obj: object): string {
  const jsonStr = JSON.stringify(obj);
  return btoa(jsonStr);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'create-order') {
      const { amount, phone, destinationName, destinationSlug, callbackUrl } = await req.json();

      if (!amount || !phone || !destinationName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate phone number
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, '').slice(-10))) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const merchantTransactionId = 'MT' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
      const merchantUserId = 'MU' + phone.replace(/\D/g, '').slice(-10);

      const payload = {
        merchantId: PHONEPE_MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: merchantUserId,
        amount: Math.round(amount * 100), // Convert to paise
        redirectUrl: `${callbackUrl}?txnId=${merchantTransactionId}&destination=${encodeURIComponent(destinationSlug)}`,
        redirectMode: 'REDIRECT',
        callbackUrl: `${callbackUrl}?txnId=${merchantTransactionId}&destination=${encodeURIComponent(destinationSlug)}`,
        mobileNumber: phone.replace(/\D/g, '').slice(-10),
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = base64Encode(payload);
      const endpoint = '/pg/v1/pay';
      const checksum = await generateChecksum(base64Payload, endpoint);

      console.log('Creating PhonePe order:', { merchantTransactionId, amount, destinationName });

      const response = await fetch(`${PHONEPE_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const responseData = await response.json();
      console.log('PhonePe response:', responseData);

      if (responseData.success && responseData.data?.instrumentResponse?.redirectInfo?.url) {
        return new Response(
          JSON.stringify({
            success: true,
            redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
            merchantTransactionId: merchantTransactionId,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('PhonePe order creation failed:', responseData);
        return new Response(
          JSON.stringify({ 
            error: responseData.message || 'Failed to create payment order',
            code: responseData.code 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'check-status') {
      const { merchantTransactionId } = await req.json();

      if (!merchantTransactionId) {
        return new Response(
          JSON.stringify({ error: 'Missing transaction ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const endpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
      const checksum = await generateChecksum('', endpoint);

      console.log('Checking payment status:', merchantTransactionId);

      const response = await fetch(`${PHONEPE_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
        },
      });

      const responseData = await response.json();
      console.log('PhonePe status response:', responseData);

      const isSuccess = responseData.success && responseData.code === 'PAYMENT_SUCCESS';

      return new Response(
        JSON.stringify({
          success: isSuccess,
          status: responseData.code,
          message: responseData.message,
          data: responseData.data,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('PhonePe payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
