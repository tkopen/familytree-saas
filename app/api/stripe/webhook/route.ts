import { NextResponse } from "next/server";
import { stripe, requireEnv } from "@/lib/stripe";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig as string, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Use service role to write DB
  const supabaseAdmin = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  async function upsertSubscription(sub: Stripe.Subscription, tenantId?: string | null) {
    const tId = tenantId || (sub.metadata?.tenant_id ?? null);
    if (!tId) return;

    await supabaseAdmin.from("subscriptions").upsert({
      tenant_id: tId,
      stripe_customer_id: (sub.customer as string) || null,
      stripe_sub_id: sub.id,
      status: sub.status,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });

    // Also update tenants.plan for gating (simple mapping)
    let plan = "free";
    // You can map priceId -> plan based on subscription items
    const items = sub.items.data || [];
    const priceIds = items.map(i => i.price?.id).filter(Boolean);
    const pro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    const club = process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB;
    if (club && priceIds.includes(club)) plan = "club";
    else if (pro && priceIds.includes(pro)) plan = "pro";

    await supabaseAdmin.from("tenants").update({ plan }).eq("id", tId);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tenantId = (session.metadata?.tenant_id as string | undefined) ?? undefined;

      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(sub, tenantId);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscription(sub, sub.metadata?.tenant_id ?? null);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
