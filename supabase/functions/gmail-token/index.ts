import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Ensure all required environment variables are set
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SITE_URL'
];

requiredEnvVars.forEach(varName => {
  if (!Deno.env.get(varName)) {
    console.error(`Missing required environment variable: ${varName}`);
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const SITE_URL = Deno.env.get('SITE_URL')!

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { code, state, userId } = await req.json()

    // Enhanced logging for debugging
    console.log('Received token exchange request');
    console.log('Client ID:', GOOGLE_CLIENT_ID.slice(0, 10) + '...');
    console.log('Redirect URI:', `${SITE_URL}/gmail-callback`);

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${SITE_URL}/gmail-callback`,
        grant_type: 'authorization_code'
      })
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Token Exchange Error:', tokens.error);
      throw new Error(tokens.error)
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Optional: Store tokens securely or link account
    const { error: upsertError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000)
      }, { 
        onConflict: 'user_id,provider' 
      })

    if (upsertError) {
      console.error('Upsert Error:', upsertError);
      throw upsertError;
    }

    return new Response(JSON.stringify({ 
      message: 'Token exchange successful',
      tokens: {
        access_token: tokens.access_token ? '✓' : '✗',
        refresh_token: tokens.refresh_token ? '✓' : '✗'
      }
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Token Exchange Failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Token exchange failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })
  }
})
