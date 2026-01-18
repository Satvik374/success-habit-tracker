import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan: 'monthly' | 'yearly';
  user_id: string;
  amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, user_id, amount }: VerifyRequest = await req.json();

    console.log(`Verifying payment for order: ${razorpay_order_id}, user: ${user_id}`);

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!keySecret) {
      console.error("Razorpay secret not configured");
      throw new Error("Razorpay secret not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      throw new Error("Supabase credentials not configured");
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const key = encoder.encode(keySecret);
    const message = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.error("Payment signature verification failed");
      return new Response(
        JSON.stringify({ success: false, error: "Payment verification failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Payment verified successfully for plan:", plan);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate subscription dates
    const now = new Date().toISOString();
    const endsAt = plan === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Upsert subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        plan: plan,
        status: 'active',
        starts_at: now,
        ends_at: endsAt,
        razorpay_subscription_id: razorpay_order_id,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (subscriptionError) {
      console.error("Error saving subscription:", subscriptionError);
      throw new Error("Failed to save subscription");
    }

    // Record payment in history
    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user_id,
        subscription_id: subscriptionData.id,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        amount: amount,
        currency: 'INR',
        plan: plan,
        status: 'success',
      });

    if (paymentError) {
      console.error("Error saving payment history:", paymentError);
      // Don't throw here, subscription was successful
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: plan,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
