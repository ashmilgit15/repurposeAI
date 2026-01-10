import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const supabaseAdmin = getSupabaseAdmin();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (userId) {
          // Update user to pro
          await supabaseAdmin
            .from("users")
            .update({ subscription_tier: "pro" })
            .eq("id", userId);

          console.log(`User ${userId} upgraded to pro`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by stripe customer ID
        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userData) {
          if (subscription.status === "active") {
            await supabaseAdmin
              .from("users")
              .update({ subscription_tier: "pro" })
              .eq("id", userData.id);
          } else if (
            subscription.status === "canceled" ||
            subscription.status === "unpaid"
          ) {
            await supabaseAdmin
              .from("users")
              .update({ subscription_tier: "free" })
              .eq("id", userData.id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Get user by stripe customer ID
        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userData) {
          await supabaseAdmin
            .from("users")
            .update({ subscription_tier: "free" })
            .eq("id", userData.id);

          console.log(`User ${userData.id} subscription ended`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Get user by stripe customer ID
        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("id, email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userData) {
          console.log(`Payment failed for user ${userData.id} (${userData.email})`);
          // Could send email notification here
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
