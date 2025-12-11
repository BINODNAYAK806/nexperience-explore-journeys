import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PHONEPE_CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID');
const PHONEPE_CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET');
const PHONEPE_MERCHANT_ID = Deno.env.get('PHONEPE_MERCHANT_ID');

// UAT URLs (switch to production URLs once merchant is activated)
const PHONEPE_AUTH_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
const PHONEPE_PAYMENT_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';
const PHONEPE_STATUS_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order';

// Production URLs (uncomment when ready for production)
// const PHONEPE_AUTH_URL = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
// const PHONEPE_PAYMENT_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
// const PHONEPE_STATUS_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/order';

async function getAccessToken(): Promise<string> {
  console.log('=== Getting OAuth Access Token ===');
  
  const response = await fetch(PHONEPE_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: PHONEPE_CLIENT_ID!,
      client_secret: PHONEPE_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  console.log('Auth Response Status:', response.status);
  console.log('Auth Response:', JSON.stringify(data, null, 2));

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || 'Failed to get access token');
  }

  return data.access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate secrets are configured
    if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET || !PHONEPE_MERCHANT_ID) {
      console.error('=== PhonePe Configuration Error ===');
      console.error('CLIENT_ID exists:', !!PHONEPE_CLIENT_ID);
      console.error('CLIENT_SECRET exists:', !!PHONEPE_CLIENT_SECRET);
      console.error('MERCHANT_ID exists:', !!PHONEPE_MERCHANT_ID);
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured properly' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'create-order') {
      const { amount, phone, destinationName, destinationSlug, callbackUrl } = await req.json();

      console.log('=== PhonePe Create Order Request ===');
      console.log('Amount:', amount);
      console.log('Phone:', phone);
      console.log('Destination:', destinationName);
      console.log('Callback URL:', callbackUrl);

      if (!amount || !phone || !destinationName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate phone number
      const phoneRegex = /^[6-9]\d{9}$/;
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      if (!phoneRegex.test(cleanPhone)) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get OAuth access token
      const accessToken = await getAccessToken();

      const merchantOrderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const payload = {
        merchantOrderId: merchantOrderId,
        amount: Math.round(amount * 100), // Convert to paise
        expireAfter: 1200, // 20 minutes
        metaInfo: {
          udf1: destinationName,
          udf2: destinationSlug,
          udf3: cleanPhone,
        },
        paymentFlow: {
          type: 'PG_CHECKOUT',
          message: `Payment for ${destinationName}`,
          merchantUrls: {
            redirectUrl: `${callbackUrl}?orderId=${merchantOrderId}&destination=${encodeURIComponent(destinationSlug)}`,
          },
        },
      };

      console.log('=== PhonePe v2 API Request ===');
      console.log('Merchant ID:', PHONEPE_MERCHANT_ID);
      console.log('Order ID:', merchantOrderId);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(PHONEPE_PAYMENT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`,
          'X-Merchant-Id': PHONEPE_MERCHANT_ID,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      console.log('=== PhonePe API Response ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.redirectUrl) {
        console.log('Payment order created successfully');
        return new Response(
          JSON.stringify({
            success: true,
            redirectUrl: responseData.redirectUrl,
            merchantOrderId: merchantOrderId,
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
      const { merchantOrderId } = await req.json();

      if (!merchantOrderId) {
        return new Response(
          JSON.stringify({ error: 'Missing order ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get OAuth access token
      const accessToken = await getAccessToken();

      console.log('=== PhonePe Status Check ===');
      console.log('Order ID:', merchantOrderId);

      const response = await fetch(`${PHONEPE_STATUS_URL}/${merchantOrderId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`,
          'X-Merchant-Id': PHONEPE_MERCHANT_ID,
        },
      });

      const responseData = await response.json();
      
      console.log('=== PhonePe Status Response ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(responseData, null, 2));

      const isSuccess = responseData.state === 'COMPLETED';

      return new Response(
        JSON.stringify({
          success: isSuccess,
          status: responseData.state,
          message: responseData.message,
          data: responseData,
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
