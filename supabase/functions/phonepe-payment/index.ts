import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS - restrict to your domains only
const ALLOWED_ORIGINS = [
  'https://nexperience-explore-journeys.lovable.app',
  'https://nexyatra.in',
  'https://www.nexyatra.in',
  'http://localhost:5173', // for local development
  'http://localhost:8080', // for local development
];

function getCorsHeaders(origin: string | null) {
  // Check if the request origin is in our allowed list
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

const PHONEPE_CLIENT_ID = Deno.env.get('PHONEPE_CLIENT_ID');
const PHONEPE_CLIENT_SECRET = Deno.env.get('PHONEPE_CLIENT_SECRET');
const PHONEPE_CLIENT_VERSION = Deno.env.get('PHONEPE_CLIENT_VERSION');
const PHONEPE_MERCHANT_ID = Deno.env.get('PHONEPE_MERCHANT_ID');

// Production URLs
const PHONEPE_AUTH_URL = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const PHONEPE_PAYMENT_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
const PHONEPE_STATUS_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/order';

// UAT URLs (uncomment for sandbox testing)
// const PHONEPE_AUTH_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';
// const PHONEPE_PAYMENT_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';
// const PHONEPE_STATUS_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order';

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
      client_version: PHONEPE_CLIENT_VERSION!,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  console.log('Auth Response Status:', response.status);

  if (!response.ok || !data.access_token) {
    throw new Error(data.message || 'Failed to get access token');
  }

  return data.access_token;
}

serve(async (req) => {
  // Get origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate secrets are configured
    if (!PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET || !PHONEPE_CLIENT_VERSION || !PHONEPE_MERCHANT_ID) {
      console.error('=== PhonePe Configuration Error ===');
      console.error('CLIENT_ID exists:', !!PHONEPE_CLIENT_ID);
      console.error('CLIENT_SECRET exists:', !!PHONEPE_CLIENT_SECRET);
      console.error('CLIENT_VERSION exists:', !!PHONEPE_CLIENT_VERSION);
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
      console.log('Amount: [redacted]');
      console.log('Destination:', destinationName?.substring(0, 20));

      if (!amount || !phone || !destinationName) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate amount - must be positive and reasonable
      if (typeof amount !== 'number' || amount <= 0 || amount > 10000000) {
        return new Response(
          JSON.stringify({ error: 'Invalid amount' }),
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

      // Validate destination name length
      if (typeof destinationName !== 'string' || destinationName.length > 200) {
        return new Response(
          JSON.stringify({ error: 'Invalid destination name' }),
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
          udf1: destinationName.substring(0, 200),
          udf2: destinationSlug ? String(destinationSlug).substring(0, 100) : '',
          udf3: cleanPhone,
        },
        paymentFlow: {
          type: 'PG_CHECKOUT',
          message: `Payment for ${destinationName.substring(0, 100)}`,
          merchantUrls: {
            redirectUrl: `${callbackUrl}?orderId=${merchantOrderId}&destination=${encodeURIComponent(destinationSlug || '')}`,
          },
        },
      };

      console.log('=== PhonePe v2 API Request ===');
      console.log('Order ID:', merchantOrderId);

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

      // Validate order ID format
      if (typeof merchantOrderId !== 'string' || !merchantOrderId.startsWith('ORDER_') || merchantOrderId.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid order ID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get OAuth access token
      const accessToken = await getAccessToken();

      console.log('=== PhonePe Status Check ===');

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
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
